/**
 * @module Effect/Mountain
 * @description
 * Atomic Mountain backend service using Effect-TS.
 * Consolidates MountainIntegrationService and MountainWindSync into a single,
 * unified backend integration layer with proper error handling and resilience.
 */

import { Context, Effect, Fiber, Layer, Schedule, Stream, SubscriptionRef } from "effect";

import { Configuration } from "./Configuration.js";
import { IPC } from "./IPC.js";
import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Mountain Error Types
// ============================================================================

export class MountainConnectionError extends Error {
	readonly _tag = "MountainConnectionError";
	override readonly cause: unknown;
	constructor(cause: unknown) {
		super(`Failed to connect to Mountain backend: ${String(cause)}`);
	}
}

export class MountainRPCError extends Error {
	readonly _tag = "MountainRPCError";
	readonly method: string;
	override readonly cause: unknown;
	constructor(method: string, cause: unknown) {
		super(`Mountain RPC '${method}' failed: ${String(cause)}`);
		this.method = method;
	}
}

export class MountainSyncError extends Error {
	readonly _tag = "MountainSyncError";
	readonly resource: string;
	override readonly cause: unknown;
	constructor(resource: string, cause: unknown) {
		super(`Mountain sync for '${resource}' failed: ${String(cause)}`);
		this.resource = resource;
	}
}

export class MountainStateError extends Error {
	readonly _tag = "MountainStateError";
	readonly expected: string;
	readonly actual: string;
	constructor(expected: string, actual: string) {
		super(`Mountain state error: expected ${expected}, got ${actual}`);
		this.expected = expected;
		this.actual = actual;
	}
}

// ============================================================================
// Connection State
// ============================================================================

export type MountainConnectionState =
	| { readonly _tag: "Idle" }
	| { readonly _tag: "Connecting"; readonly attempt: number }
	| { readonly _tag: "Connected"; readonly version: string }
	| { readonly _tag: "Disconnected"; readonly reason: string }
	| { readonly _tag: "Error"; readonly error: Error };

// ============================================================================
// Sync Resource Types
// ============================================================================

export interface SyncResource {
	readonly type: "configuration" | "services" | "state" | "files";
	readonly id: string;
	readonly data: unknown;
	readonly timestamp: number;
	readonly hash: string;
}

export interface SyncResult {
	readonly success: boolean;
	readonly resourcesSynced: number;
	readonly errors: ReadonlyArray<string>;
	readonly duration: number;
}

// ============================================================================
// Mountain Service Interface
// ============================================================================

export interface MountainService {
	/** Current connection state */
	readonly connectionState: Effect.Effect<MountainConnectionState, never>;

	/** Stream of connection state changes */
	readonly connectionChanges: Stream.Stream<MountainConnectionState, never>;

	/** Connect to Mountain backend */
	readonly connect: Effect.Effect<void, MountainConnectionError>;

	/** Disconnect from Mountain backend */
	readonly disconnect: Effect.Effect<void, never>;

	/** Execute RPC method */
	readonly rpc: <T>(
		method: string,
	) => (args?: Record<string, unknown>) => Effect.Effect<T, MountainRPCError>;

	/** Sync a specific resource type */
	readonly sync: (
		resourceType: SyncResource["type"],
	) => Effect.Effect<SyncResult, MountainSyncError>;

	/** Stream of all sync events */
	readonly syncEvents: Stream.Stream<SyncResource, never>;

	/** Get Mountain version */
	readonly version: Effect.Effect<string, MountainConnectionError>;

	/** Health check */
	readonly healthCheck: Effect.Effect<boolean, MountainConnectionError>;
}

export class MountainTag extends Context.Tag("Mountain")<
	MountainTag,
	MountainService
>() {}

export const Mountain = MountainTag;

// ============================================================================
// Implementation
// ============================================================================

export const MountainLive = Layer.effect(
	Mountain,
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

// ============================================================================
// Mock Implementation
// ============================================================================

export const MountainMockLive = Layer.succeed(Mountain, {
	connectionState: Effect.succeed({
		_tag: "Connected" as const,
		version: "mock",
	}),
	connectionChanges: Stream.empty,
	connect: Effect.void,
	disconnect: Effect.void,
	rpc: () => () => Effect.succeed({} as any),
	sync: () =>
		Effect.succeed({
			success: true,
			resourcesSynced: 0,
			errors: [],
			duration: 0,
		}),
	syncEvents: Stream.empty,
	version: Effect.succeed("mock"),
	healthCheck: Effect.succeed(true),
});
