/**
 * @module Effect/Mountain/Implementation/MountainImplementation
 * @description
 * Main implementation of Mountain service with connection management and sync.
 * Provides production-ready implementation with telemetry and background sync.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */

import { Context, Effect, Fiber, Layer, Schedule, Stream, SubscriptionRef } from "effect";

import { MountainTag } from "../Tag/MountainTag.js";
import type { MountainService } from "../Interface/MountainService.js";
import type { MountainConnectionState, SyncResource, SyncResult } from "../Type/MountainType.js";
import { MountainConnectionError } from "../Error/MountainConnectionError.js";
import { MountainRPCError } from "../Error/MountainRPCError.js";
import { MountainSyncError } from "../Error/MountainSyncError.js";
import { MountainStateError } from "../Error/MountainStateError.js";
import { Configuration } from "../../Configuration.js";
import { IPC } from "../../IPC.js";
import { Telemetry } from "../../Telemetry.js";

// ============================================================================
// Live Implementation
// ============================================================================

/**
 * Live implementation layer for Mountain service.
 * Provides reactive connection management with automatic retry and background sync.
 */
export const MountainLive = Layer.effect(
	MountainTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;
		const ConfigurationService = yield* Configuration;
		const TelemetryService = yield* Telemetry;

		// Connection state as reactive ref
		const StateRef = yield* SubscriptionRef.make<MountainConnectionState>({
			_tag: "Idle",
		});

		// Sync events stream
		const SyncEventsRef = yield* SubscriptionRef.make<
			ReadonlyArray<SyncResource>
		>([]);

		// Retry schedule: exponential backoff with max 30s
		const RetrySchedule = Schedule.exponential("100 millis").pipe(
			Schedule.union(Schedule.spaced("5 seconds")),
			Schedule.intersect(Schedule.recurs(10)),
		);

		// Helper: withSpan using captured telemetry (no external dependencies)
		const WithSpanLocal = <A, E>(
			Name: string,
			EffectPayload: Effect.Effect<A, E, never>,
		): Effect.Effect<A, E, never> =>
			Effect.gen(function* () {
				const Span = yield* TelemetryService.startSpan(Name);
				return yield* EffectPayload.pipe(
					Effect.tap(() => Span.end(true)),
					Effect.catchAll((Error) =>
						Effect.gen(function* () {
						const ErrorValue = Error as Error;
						const ErrorMsg = ErrorValue.message;
						yield* Span.end(false, ErrorMsg);
						return yield* Effect.fail(ErrorValue);
					}),
				),
				);
			});

		// Atom: Update connection state
		const SetState = (State: MountainConnectionState) =>
			Effect.gen(function* () {
				yield* SubscriptionRef.modify(StateRef, () => [undefined, State]);
				yield* TelemetryService.log("info", `Mountain state: ${State._tag}`);
			});

		// Atom: Get current state
		const ConnectionState = StateRef.get;
		const ConnectionChanges = StateRef.changes;

		// Atom: Connect to Mountain
		const Connect = Effect.gen(function* () {
			yield* SetState({ _tag: "Connecting", attempt: 1 });

			const ConnectionEffect = Effect.gen(function* () {
				const Status = yield* IPCService
					.invoke("mountain_get_status")([])
					.pipe(
						Effect.map((Result): { connected: boolean; version: string } => {
							const APIStatus = Result as { connected?: boolean; version?: string };
							return {
								connected: APIStatus.connected ?? false,
								version: APIStatus.version ?? "unknown",
							};
						}),
						Effect.mapError(
							(Error) => new MountainConnectionError(Error),
						),
					);

				if (!Status.connected) {
					yield* Effect.fail(
						new MountainConnectionError("Mountain not ready"),
					);
				}

				yield* SetState({
					_tag: "Connected",
					version: Status.version,
				});
				yield* TelemetryService.log(
					"info",
					`Connected to Mountain v${Status.version}`,
				);
			}) satisfies Effect.Effect<void, MountainConnectionError, never>;

			return yield* Effect.retry(
				WithSpanLocal("mountain_connect", ConnectionEffect),
				RetrySchedule,
			).pipe(
				Effect.catchAll((Error) =>
					Effect.gen(function* () {
						const ErrorObj = Error instanceof Error ? Error : new Error(String(Error));
						yield* SetState({ _tag: "Error", error: ErrorObj });
						yield* TelemetryService.log(
							"error",
							`Failed to connect: ${ErrorObj.message}`,
						);
						yield* Effect.fail(Error as MountainConnectionError);
					}),
				),
			);
		}) satisfies Effect.Effect<void, MountainConnectionError, never>;

		// Atom: Disconnect
		const Disconnect = Effect.gen(function* () {
			yield* SetState({ _tag: "Disconnected", reason: "manual" });
			yield* TelemetryService.log("info", "Disconnected from Mountain");
		});

		// Atom: RPC with telemetry
		const RPC: MountainService["rpc"] = (Method) => (Args) =>
			Effect.gen(function* () {
				const CurrentState = yield* StateRef.get;

				if (CurrentState._tag !== "Connected") {
					// Auto-connect if not connected
					yield* Connect;
				}

				const Span = yield* TelemetryService.startSpan(`rpc_${Method}`);

				return yield* IPCService
					.invoke(Method)(Args ? [Args] : [])
					.pipe(
						Effect.mapError(
							(Error) => new MountainRPCError(Method, Error),
						),
						Effect.tap(() => Span.end(true)),
						Effect.catchAll((Error) =>
							Effect.gen(function* () {
								const ErrorMessage = Error instanceof Error ? Error.message : String(Error);
								yield* Span.end(false, ErrorMessage);

								// Check if connection lost
								if (
									ErrorMessage.includes("connection") ||
									ErrorMessage.includes("network")
								) {
									yield* SetState({
										_tag: "Disconnected",
										reason: "connection_lost",
									});
								}

								yield* Effect.fail(Error as MountainRPCError);
							}),
						),
					) as any;
			}) as any;

		// Atom: Sync resource
		const Sync = (ResourceType: SyncResource["type"]) =>
			Effect.gen(function* () {
				const Span = yield* TelemetryService.startSpan(`sync_${ResourceType}`);
				const StartTime = Date.now();

				yield* TelemetryService.log(
					"info",
					`Starting sync for ${ResourceType}`,
				);

				const Result = yield* Effect.gen(function* () {
					switch (ResourceType) {
						case "configuration": {
							const MountainConfig = (yield* RPC("mountain_get_configuration")()) as any;
							const LocalConfig = yield* ConfigurationService.get;

							// Detect changes
							const MountainHash = JSON.stringify(MountainConfig);
							const LocalHash = JSON.stringify(LocalConfig);

							if (MountainHash !== LocalHash) {
								yield* ConfigurationService.apply(MountainConfig as any);

								const Resource: SyncResource = {
									type: "configuration",
									id: "main",
									data: MountainConfig,
									timestamp: Date.now(),
									hash: MountainHash,
								};

								yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [undefined, [...Events, Resource].slice(-1000)]);
							}

							return {
								success: true,
								resourcesSynced: 1,
								errors: [],
							};
						}

						case "services": {
							const Services = (yield* RPC("mountain_get_services_status")()) as any;

							const Resource: SyncResource = {
								type: "services",
								id: "all",
								data: Services,
								timestamp: Date.now(),
								hash: JSON.stringify(Services),
							};

							yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [undefined, [...Events, Resource].slice(-1000)]);

							return {
								success: true,
								resourcesSynced: Object.keys(Services).length,
								errors: [],
							};
						}

						case "state": {
							const State = (yield* RPC("mountain_get_state")()) as any;

							const Resource: SyncResource = {
								type: "state",
								id: "main",
								data: State,
								timestamp: Date.now(),
								hash: JSON.stringify(State),
							};

							yield* SubscriptionRef.modify(SyncEventsRef, (Events) => [undefined, [...Events, Resource].slice(-1000)]);

							return {
								success: true,
								resourcesSynced: 1,
								errors: [],
							};
						}

						default:
							return {
								success: false,
								resourcesSynced: 0,
								errors: [
									`Unknown resource type: ${ResourceType}`,
								],
							};
					}
				}).pipe(
					Effect.tap((InnerResult) =>
						Span.end(InnerResult.success, InnerResult.errors[0]),
					),
					Effect.catchAll((Error) =>
						Effect.gen(function* () {
							const ErrorMessage = Error instanceof Error ? Error.message : String(Error);
							yield* Span.end(false, ErrorMessage);
							yield* Effect.fail(
								new MountainSyncError(ResourceType, Error),
							);
						}),
					),
				);

				const Duration = Date.now() - StartTime;

				return {
					...Result,
					duration: Duration,
				} as SyncResult;
			});

		// Stream of sync events
		const SyncEvents = SyncEventsRef.changes.pipe(
			Stream.flatMap((Events) => Stream.fromIterable(Events)),
		);

		// Atom: Get version - using raw IPC to avoid error type issues
		const Version: MountainService["version"] = Effect.gen(function* () {
			const Status = yield* IPCService
				.invoke("mountain_get_status")([])
				.pipe(
					Effect.map((Result): { version: string } => {
						const APIStatus = Result as { connected?: boolean; version?: string };
						return { version: APIStatus.version ?? "unknown" };
					}),
					Effect.mapError((Error) => new MountainConnectionError(Error)),
				);
			return Status.version;
		});

		// Atom: Health check
		const HealthCheck = Effect.gen(function* () {
			return yield* Effect.orElse(
				RPC("mountain_get_status")().pipe(
					Effect.map((Status: any) => Status.connected === true),
				),
				() => Effect.succeed(false),
			);
		});

		// Set up background sync on connection
		const SetupBackgroundSync = Effect.gen(function* () {
			yield* Stream.runForEach(ConnectionChanges, (State) =>
				State._tag === "Connected"
					? Effect.gen(function* () {
							yield* TelemetryService.log(
								"info",
								"Starting background sync",
							);

							// Initial sync
							yield* Sync("configuration").pipe(
								Effect.catchAll((Error) =>
									TelemetryService.log(
										"error",
										`Initial config sync failed: ${Error.message}`,
									),
								),
							);

							// Periodic sync every 5 seconds
							const SyncFiber = yield* Stream.fromSchedule(
								Schedule.spaced("5 seconds"),
							).pipe(
								Stream.runForEach(() =>
									Sync("configuration").pipe(
										Effect.catchAll((Error) =>
											TelemetryService.log(
												"error",
												`Periodic sync failed: ${Error.message}`,
											),
										),
									),
								),
								Effect.fork,
							);

							// Stop sync on disconnect
							yield* ConnectionChanges.pipe(
								Stream.filter(
									(S) =>
										S._tag === "Disconnected" ||
										S._tag === "Error",
								),
								Stream.runForEach(() =>
									Fiber.interrupt(SyncFiber),
								),
							);
						})
					: Effect.void,
				);
		}).pipe(Effect.fork);

		yield* SetupBackgroundSync;

		yield* TelemetryService.log("info", "Mountain service initialized");

		return {
			connectionState: ConnectionState,
			connectionChanges: ConnectionChanges,
			connect: Connect,
			disconnect: Disconnect,
			rpc: RPC,
			sync: Sync,
			syncEvents: SyncEvents,
			version: Version,
			healthCheck: HealthCheck,
		};
	}),
);

export default MountainLive;
