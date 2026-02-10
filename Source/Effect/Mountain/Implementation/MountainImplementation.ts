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
		const ipc = yield* IPC;
		const config = yield* Configuration;
		const telemetry = yield* Telemetry;

		// Connection state as reactive ref
		const stateRef = yield* SubscriptionRef.make<MountainConnectionState>({
			_tag: "Idle",
		});

		// Sync events stream
		const syncEventsRef = yield* SubscriptionRef.make<
			ReadonlyArray<SyncResource>
		>([]);

		// Retry schedule: exponential backoff with max 30s
		const retrySchedule = Schedule.exponential("100 millis").pipe(
			Schedule.union(Schedule.spaced("5 seconds")),
			Schedule.intersect(Schedule.recurs(10)),
		);

		// Helper: withSpan using captured telemetry (no external dependencies)
		const withSpanLocal = <A, E>(
			name: string,
			effect: Effect.Effect<A, E, never>,
		): Effect.Effect<A, E, never> =>
			Effect.gen(function* () {
				const span = yield* telemetry.startSpan(name);
				return yield* effect.pipe(
					Effect.tap(() => span.end(true)),
					Effect.catchAll((error) =>
						Effect.gen(function* () {
							const errorMsg = error instanceof Error ? error.message : String(error);
							yield* span.end(false, errorMsg);
							return yield* Effect.fail(error);
						}),
					),
				);
			});

		// Atom: Update connection state
		const setState = (state: MountainConnectionState) =>
			Effect.gen(function* () {
				yield* SubscriptionRef.modify(stateRef, () => [undefined, state]);
				yield* telemetry.log("info", `Mountain state: ${state._tag}`);
			});

		// Atom: Get current state
		const connectionState = stateRef.get;
		const connectionChanges = stateRef.changes;

		// Atom: Connect to Mountain
		const connect = Effect.gen(function* () {
			yield* setState({ _tag: "Connecting", attempt: 1 });

			const connectionEffect = Effect.gen(function* () {
				const status = yield* ipc
					.invoke("mountain_get_status")([])
					.pipe(
						Effect.map((result): { connected: boolean; version: string } => {
							const apiStatus = result as { connected?: boolean; version?: string };
							return {
								connected: apiStatus.connected ?? false,
								version: apiStatus.version ?? "unknown",
							};
						}),
						Effect.mapError(
							(error) => new MountainConnectionError(error),
						),
					);

				if (!status.connected) {
					yield* Effect.fail(
						new MountainConnectionError("Mountain not ready"),
					);
				}

				yield* setState({
					_tag: "Connected",
					version: status.version,
				});
				yield* telemetry.log(
					"info",
					`Connected to Mountain v${status.version}`,
				);
			}) satisfies Effect.Effect<void, MountainConnectionError, never>;

			return yield* Effect.retry(
				withSpanLocal("mountain_connect", connectionEffect),
				retrySchedule,
			).pipe(
				Effect.catchAll((error) =>
					Effect.gen(function* () {
						const errorObj = error instanceof Error ? error : new Error(String(error));
						yield* setState({ _tag: "Error", error: errorObj });
						yield* telemetry.log(
							"error",
							`Failed to connect: ${errorObj.message}`,
						);
						yield* Effect.fail(error as MountainConnectionError);
					}),
				),
			);
		}) satisfies Effect.Effect<void, MountainConnectionError, never>;

		// Atom: Disconnect
		const disconnect = Effect.gen(function* () {
			yield* setState({ _tag: "Disconnected", reason: "manual" });
			yield* telemetry.log("info", "Disconnected from Mountain");
		});

		// Atom: RPC with telemetry
		const rpc: MountainService["rpc"] = (method) => (args) =>
			Effect.gen(function* () {
				const currentState = yield* stateRef.get;

				if (currentState._tag !== "Connected") {
					// Auto-connect if not connected
					yield* connect;
				}

				const span = yield* telemetry.startSpan(`rpc_${method}`);

				return yield* ipc
					.invoke(method)(args ? [args] : [])
					.pipe(
						Effect.mapError(
							(error) => new MountainRPCError(method, error),
						),
						Effect.tap(() => span.end(true)),
						Effect.catchAll((error) =>
							Effect.gen(function* () {
								const errorMessage = error instanceof Error ? error.message : String(error);
								yield* span.end(false, errorMessage);

								// Check if connection lost
								if (
									errorMessage.includes("connection") ||
									errorMessage.includes("network")
								) {
									yield* setState({
										_tag: "Disconnected",
										reason: "connection_lost",
									});
								}

								yield* Effect.fail(error as MountainRPCError);
							}),
						),
					) as any;
			}) as any;

		// Atom: Sync resource
		const sync = (resourceType: SyncResource["type"]) =>
			Effect.gen(function* () {
				const span = yield* telemetry.startSpan(`sync_${resourceType}`);
				const startTime = Date.now();

				yield* telemetry.log(
					"info",
					`Starting sync for ${resourceType}`,
				);

				const result = yield* Effect.gen(function* () {
					switch (resourceType) {
						case "configuration": {
							const mountainConfig = (yield* rpc("mountain_get_configuration")()) as any;
							const localConfig = yield* config.get;

							// Detect changes
							const mountainHash = JSON.stringify(mountainConfig);
							const localHash = JSON.stringify(localConfig);

							if (mountainHash !== localHash) {
								yield* config.apply(mountainConfig as any);

								const resource: SyncResource = {
									type: "configuration",
									id: "main",
									data: mountainConfig,
									timestamp: Date.now(),
									hash: mountainHash,
								};

								yield* SubscriptionRef.modify(syncEventsRef, (events) => [undefined, [...events, resource].slice(-1000)]);
							}

							return {
								success: true,
								resourcesSynced: 1,
								errors: [],
							};
						}

						case "services": {
							const services = (yield* rpc("mountain_get_services_status")()) as any;

							const resource: SyncResource = {
								type: "services",
								id: "all",
								data: services,
								timestamp: Date.now(),
								hash: JSON.stringify(services),
							};

							yield* SubscriptionRef.modify(syncEventsRef, (events) => [undefined, [...events, resource].slice(-1000)]);

							return {
								success: true,
								resourcesSynced: Object.keys(services).length,
								errors: [],
							};
						}

						case "state": {
							const state = (yield* rpc("mountain_get_state")()) as any;

							const resource: SyncResource = {
								type: "state",
								id: "main",
								data: state,
								timestamp: Date.now(),
								hash: JSON.stringify(state),
							};

							yield* SubscriptionRef.modify(syncEventsRef, (events) => [undefined, [...events, resource].slice(-1000)]);

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
									`Unknown resource type: ${resourceType}`,
								],
							};
					}
				}).pipe(
					Effect.tap((result) =>
						span.end(result.success, result.errors[0]),
					),
					Effect.catchAll((error) =>
						Effect.gen(function* () {
							const errorMessage = error instanceof Error ? error.message : String(error);
							yield* span.end(false, errorMessage);
							yield* Effect.fail(
								new MountainSyncError(resourceType, error),
							);
						}),
					),
				);

				const duration = Date.now() - startTime;

				return {
					...result,
					duration,
				} as SyncResult;
			});

		// Stream of sync events
		const syncEvents = syncEventsRef.changes.pipe(
			Stream.flatMap((events) => Stream.fromIterable(events)),
		);

		// Atom: Get version - using raw IPC to avoid error type issues
		const version: MountainService["version"] = Effect.gen(function* () {
			const status = yield* ipc
				.invoke("mountain_get_status")([])
				.pipe(
					Effect.map((result): { version: string } => {
						const apiStatus = result as { connected?: boolean; version?: string };
						return { version: apiStatus.version ?? "unknown" };
					}),
					Effect.mapError((error) => new MountainConnectionError(error)),
				);
			return status.version;
		});

		// Atom: Health check
		const healthCheck = Effect.gen(function* () {
			return yield* Effect.orElse(
				rpc("mountain_get_status")().pipe(
					Effect.map((status: any) => status.connected === true),
				),
				() => Effect.succeed(false),
			);
		});

		// Set up background sync on connection
		const setupBackgroundSync = Effect.gen(function* () {
			yield* Stream.runForEach(connectionChanges, (state) =>
				state._tag === "Connected"
					? Effect.gen(function* () {
							yield* telemetry.log(
								"info",
								"Starting background sync",
							);

							// Initial sync
							yield* sync("configuration").pipe(
								Effect.catchAll((error) =>
									telemetry.log(
										"error",
										`Initial config sync failed: ${error.message}`,
									),
								),
							);

							// Periodic sync every 5 seconds
							const syncFiber = yield* Stream.fromSchedule(
								Schedule.spaced("5 seconds"),
							).pipe(
								Stream.runForEach(() =>
									sync("configuration").pipe(
										Effect.catchAll((error) =>
											telemetry.log(
												"error",
												`Periodic sync failed: ${error.message}`,
											),
										),
									),
								),
								Effect.fork,
							);

							// Stop sync on disconnect
							yield* connectionChanges.pipe(
								Stream.filter(
									(s) =>
										s._tag === "Disconnected" ||
										s._tag === "Error",
								),
								Stream.runForEach(() =>
									Fiber.interrupt(syncFiber),
								),
							);
						})
					: Effect.void,
			);
		}).pipe(Effect.fork);

		yield* setupBackgroundSync;

		yield* telemetry.log("info", "Mountain service initialized");

		return {
			connectionState,
			connectionChanges,
			connect,
			disconnect,
			rpc,
			sync,
			syncEvents,
			version,
			healthCheck,
		};
	}),
);

export default MountainLive;
