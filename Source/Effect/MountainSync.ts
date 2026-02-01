/**
 * @module Effect/MountainSync
 * @description
 * Mountain-Wind synchronization service using Effect-TS.
 * Replaces class-based MountainWindSync with Effect-based reactive sync.
 */

import { Context, Effect, Layer, Fiber } from "effect";
import { Mountain, MountainTag, type MountainService } from "./Mountain.js";
import { IPC, type IPCService } from "./IPC.js";
import { Telemetry, TelemetryTag, type TelemetryService } from "./Telemetry.js";

// ============================================================================
// TYPES
// ============================================================================

export type SyncStatus = "idle" | "syncing" | "paused" | "error";

export interface SyncConfig {
	readonly enabled: boolean;
	readonly syncIntervalMs: number;
	readonly autoRetry: boolean;
	readonly maxRetries: number;
	readonly batchSize: number;
}

export interface SyncStats {
	readonly lastSyncTime: number;
	readonly syncCount: number;
	readonly successCount: number;
	readonly errorCount: number;
	readonly itemsSynced: number;
}

export interface MountainSyncService {
	readonly start: (config?: Partial<SyncConfig>) => Effect.Effect<void>;
	readonly stop: () => Effect.Effect<void>;
	readonly syncNow: () => Effect.Effect<SyncResult>;
	readonly getStatus: () => Effect.Effect<SyncStatus>;
	readonly getStats: () => Effect.Effect<SyncStats>;
	readonly pause: () => Effect.Effect<void>;
	readonly resume: () => Effect.Effect<void>;
}

export interface SyncResult {
	readonly success: boolean;
	readonly itemsSynced: number;
	readonly duration: number;
	readonly error?: Error;
}

// ============================================================================
// SERVICE TAG
// ============================================================================

export class MountainSyncTag extends Context.Tag("Effect/MountainSyncService")<
	MountainSyncTag,
	MountainSyncService
>() {}

// ============================================================================
// SYNC EFFECT
// ============================================================================

const syncNowEffect = (
	_mountain: MountainService,
	_ipc: IPCService,
	telemetry: TelemetryService,
): Effect.Effect<SyncResult> =>
	Effect.gen(function* () {
		const startTime = Date.now();

		// TODO: Implement actual sync logic
		// This would fetch changes from Mountain, sync state, etc.

		yield* telemetry.log("info", "[MountainSync] Performing sync...");

		// Mock sync for now
		yield* Effect.sleep(10);

		return {
			success: true,
			itemsSynced: 0,
			duration: Date.now() - startTime,
		} satisfies SyncResult;
	});

// ============================================================================
// IMPLEMENTATION
// ============================================================================

const makeMountainSync = (
	mountain: MountainService,
	ipc: IPCService,
	telemetry: TelemetryService,
): MountainSyncService => {
	// Internal state management
	let syncFiber: Fiber.Fiber<void, never> | null = null;

	return {
		start: (config?: Partial<SyncConfig>) =>
			Effect.gen(function* () {
				const fullConfig: SyncConfig = {
					enabled: true,
					syncIntervalMs: 5000,
					autoRetry: true,
					maxRetries: 3,
					batchSize: 100,
					...config,
				};

				if (!fullConfig.enabled) {
					yield* telemetry.log("info", "[MountainSync] Sync disabled in config");
					return;
				}

				yield* telemetry.log(
					"info",
					`[MountainSync] Starting sync with ${fullConfig.syncIntervalMs}ms interval`,
				);

				const startSyncing = Effect.gen(function* () {
					// Main sync loop
					yield* Effect.forever(
						Effect.gen(function* () {
							yield* Effect.sleep(fullConfig.syncIntervalMs);

							const result = yield* syncNowEffect(mountain, ipc, telemetry);

							if (result.success) {
								yield* telemetry.log(
									"info",
									`[MountainSync] Synced ${result.itemsSynced} items in ${result.duration}ms`,
								);
							} else if (fullConfig.autoRetry) {
								yield* telemetry.log(
									"warn",
									`[MountainSync] Sync failed, will retry: ${result.error?.message}`,
								);
							}
						}),
					);
				});

				syncFiber = yield* startSyncing.pipe(Effect.fork);
			}),

		stop: () =>
			Effect.gen(function* () {
				if (syncFiber) {
					yield* Fiber.interrupt(syncFiber);
					syncFiber = null;
					yield* telemetry.log("info", "[MountainSync] Stopped");
				}
			}),

		syncNow: () => syncNowEffect(mountain, ipc, telemetry),

		getStatus: () => Effect.sync(() => "idle" as SyncStatus),

		getStats: () =>
			Effect.gen(function* () {
				const now = Date.now();
				return {
					lastSyncTime: now,
					syncCount: 1,
					successCount: 1,
					errorCount: 0,
					itemsSynced: 0,
				} satisfies SyncStats;
			}),

		pause: () =>
			Effect.gen(function* () {
				yield* telemetry.log("info", "[MountainSync] Pausing...");
			}),

		resume: () =>
			Effect.gen(function* () {
				yield* telemetry.log("info", "[MountainSync] Resuming...");
			}),
	};
};

// ============================================================================
// LAYERS
// ============================================================================

export const MountainSyncLive = Layer.effect(
	MountainSyncTag,
	Effect.gen(function* () {
		const mountain = yield* MountainTag;
		const ipc = yield* IPCTag;
		const telemetry = yield* TelemetryTag;

		return makeMountainSync(mountain, ipc, telemetry);
	}),
);

// ============================================================================
// MOCK FOR TESTING
// ============================================================================

export const makeMockMountainSync = (): MountainSyncService => ({
	start: () => Effect.void,
	stop: () => Effect.void,
	syncNow: () =>
		Effect.gen(function* () {
			return {
				success: true,
				itemsSynced: 0,
				duration: 1,
			} satisfies SyncResult;
		}),
	getStatus: () => Effect.succeed("idle" as const),
	getStats: () =>
		Effect.succeed({
			lastSyncTime: Date.now(),
			syncCount: 0,
			successCount: 0,
			errorCount: 0,
			itemsSynced: 0,
		} satisfies SyncStats),
	pause: () => Effect.void,
	resume: () => Effect.void,
});

export const MountainSyncMock = Layer.effect(
	MountainSyncTag,
	Effect.succeed(makeMockMountainSync()),
);
