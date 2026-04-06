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

import type { IPCService } from "../../IPC.js";
import type { MountainService } from "../../Mountain.js";
import type { TelemetryService } from "../../Telemetry.js";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
import type {
	SyncConfig,
	SyncStats,
	SyncStatus,
} from "../Type/MountainSyncType.js";
import SyncNowEffect from "./MountainSyncHelper.js";

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
	Mountain: MountainService,
	IPC: IPCService,
	TelemetryService: TelemetryService,
): MountainSyncService => {
	// Internal state management
	let SyncFiber: Fiber.Fiber<void, never> | null = null;
	let SyncStatus: SyncStatus = "idle";
	let LastSyncTime = 0;
	let SyncCount = 0;
	let SuccessCount = 0;
	let ErrorCount = 0;
	let ItemsSynced = 0;

	return {
		start: (Config?: Partial<SyncConfig>) =>
			Effect.gen(function* () {
				const FullConfig: SyncConfig = {
					...defaultSyncConfig,
					...Config,
				};

				if (!FullConfig.enabled) {
					yield* TelemetryService.log(
						"info",
						"[MountainSync] Sync disabled in config",
					);
					return;
				}

				yield* TelemetryService.log(
					"info",
					`[MountainSync] Starting sync with ${FullConfig.syncIntervalMs}ms interval`,
				);

				SyncStatus = "syncing";

				const StartSyncing = Effect.gen(function* () {
					// Main sync loop
					yield* Effect.forever(
						Effect.gen(function* () {
							yield* Effect.sleep(
								`${FullConfig.syncIntervalMs} millis`,
							);

							const Result = yield* SyncNowEffect(
								Mountain,
								IPC,
								TelemetryService,
							);

							// Update stats
							LastSyncTime = Date.now();
							SyncCount++;
							ItemsSynced += Result.itemsSynced;

							if (Result.success) {
								SuccessCount++;
								yield* TelemetryService.log(
									"info",
									`[MountainSync] Synced ${Result.itemsSynced} items in ${Result.duration}ms`,
								);
							} else if (FullConfig.autoRetry) {
								ErrorCount++;
								yield* TelemetryService.log(
									"warn",
									`[MountainSync] Sync failed, will retry: ${Result.error?.message}`,
								);
							}
						}),
					);
				});

				SyncFiber = yield* StartSyncing.pipe(Effect.fork);
			}),

		stop: () =>
			Effect.gen(function* () {
				if (SyncFiber) {
					yield* Fiber.interrupt(SyncFiber);
					SyncFiber = null;
					SyncStatus = "idle";
					yield* TelemetryService.log(
						"info",
						"[MountainSync] Stopped",
					);
				}
			}),

		syncNow: () => SyncNowEffect(Mountain, IPC, TelemetryService),

		getStatus: () => Effect.sync(() => SyncStatus),

		getStats: () =>
			Effect.gen(function* () {
				return {
					lastSyncTime: LastSyncTime,
					syncCount: SyncCount,
					successCount: SuccessCount,
					errorCount: ErrorCount,
					itemsSynced: ItemsSynced,
				};
			}),

		pause: () =>
			Effect.gen(function* () {
				SyncStatus = "paused";
				yield* TelemetryService.log(
					"info",
					"[MountainSync] Pausing...",
				);
			}),

		resume: () =>
			Effect.gen(function* () {
				SyncStatus = "syncing";
				yield* TelemetryService.log(
					"info",
					"[MountainSync] Resuming...",
				);
			}),
	};
};

export default makeMountainSync;
