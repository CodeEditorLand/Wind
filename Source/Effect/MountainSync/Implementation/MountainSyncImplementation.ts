/**
 * @module Effect/MountainSync/Implementation/MountainSyncImplementation
 * @description
 * Main implementation factory for MountainSync service.
 * Creates MountainSync service instances with background sync capabilities.
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Tag/MountainSyncTag} Service tag
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @category Implementation
 */

import { Effect, Fiber } from "effect";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
import type { SyncConfig, SyncStats, SyncStatus } from "../Type/MountainSyncType.js";
import type { MountainService } from "../../Mountain.js";
import type { IPCService } from "../../IPC.js";
import type { TelemetryService } from "../../Telemetry.js";
import syncNowEffect from "./MountainSyncHelper.js";

/**
 * Default sync configuration values.
 * Provides reasonable defaults for sync behavior.
 */
const defaultSyncConfig: SyncConfig = {
	enabled: true,
	syncIntervalMs: 5000,
	autoRetry: true,
	maxRetries: 3,
	batchSize: 100,
};

/**
 * Creates a MountainSync service instance.
 * Manages background synchronization between Mountain and Wind.
 *
 * @param mountain - Mountain service for backend operations
 * @param ipc - IPC service for communication
 * @param telemetry - Telemetry service for logging
 * @returns MountainSync service instance
 */
const makeMountainSync = (
	mountain: MountainService,
	ipc: IPCService,
	telemetry: TelemetryService,
): MountainSyncService => {
	// Internal state management
	let syncFiber: Fiber.Fiber<void, never> | null = null;
	let syncStatus: SyncStatus = "idle";
	let lastSyncTime = 0;
	let syncCount = 0;
	let successCount = 0;
	let errorCount = 0;
	let itemsSynced = 0;

	return {
		start: (config?: Partial<SyncConfig>) =>
			Effect.gen(function* () {
				const fullConfig: SyncConfig = {
					...defaultSyncConfig,
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

				syncStatus = "syncing";

				const startSyncing = Effect.gen(function* () {
					// Main sync loop
					yield* Effect.forever(
						Effect.gen(function* () {
							yield* Effect.sleep(`${fullConfig.syncIntervalMs} millis`);

							const result = yield* syncNowEffect(mountain, ipc, telemetry);

							// Update stats
							lastSyncTime = Date.now();
							syncCount++;
							itemsSynced += result.itemsSynced;

							if (result.success) {
								successCount++;
								yield* telemetry.log(
									"info",
									`[MountainSync] Synced ${result.itemsSynced} items in ${result.duration}ms`,
								);
							} else if (fullConfig.autoRetry) {
								errorCount++;
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
					syncStatus = "idle";
					yield* telemetry.log("info", "[MountainSync] Stopped");
				}
			}),

		syncNow: () => syncNowEffect(mountain, ipc, telemetry),

		getStatus: () => Effect.sync(() => syncStatus),

		getStats: () =>
			Effect.gen(function* () {
				return {
					lastSyncTime,
					syncCount,
					successCount,
					errorCount,
					itemsSynced,
				};
			}),

		pause: () =>
			Effect.gen(function* () {
				syncStatus = "paused";
				yield* telemetry.log("info", "[MountainSync] Pausing...");
			}),

		resume: () =>
			Effect.gen(function* () {
				syncStatus = "syncing";
				yield* telemetry.log("info", "[MountainSync] Resuming...");
			}),
	};
};

export default makeMountainSync;
