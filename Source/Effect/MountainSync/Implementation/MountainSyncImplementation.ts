/**
 * @module Effect/MountainSync/Implementation/MountainSyncImplementation
 * @description
 * Main implementation factory for MountainSync service.
 * Creates MountainSync service instances with background sync capabilities.
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @category Implementation
 */

import type { IPCService } from "../../IPC.js";
import type { MountainService } from "../../Mountain.js";
import type { TelemetryService } from "../../Telemetry.js";
import type { MountainSyncService } from "../Interface/MountainSyncService.js";
import type { SyncConfig, SyncStatus } from "../Type/MountainSyncType.js";
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
	let SyncTimer: ReturnType<typeof setInterval> | null = null;
	let SyncStatus: SyncStatus = "idle";
	let LastSyncTime = 0;
	let SyncCount = 0;
	let SuccessCount = 0;
	let ErrorCount = 0;
	let ItemsSynced = 0;

	return {
		start: async (Config?: Partial<SyncConfig>) => {
			const FullConfig: SyncConfig = {
				...defaultSyncConfig,
				...Config,
			};

			if (!FullConfig.enabled) {
				await TelemetryService.log(
					"info",
					"[MountainSync] Sync disabled in config",
				);
				return;
			}

			await TelemetryService.log(
				"info",
				`[MountainSync] Starting sync with ${FullConfig.syncIntervalMs}ms interval`,
			);

			SyncStatus = "syncing";

			// Clear any existing timer
			if (SyncTimer) clearInterval(SyncTimer);

			SyncTimer = setInterval(async () => {
				try {
					const Result = await SyncNowEffect(
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
						await TelemetryService.log(
							"info",
							`[MountainSync] Synced ${Result.itemsSynced} items in ${Result.duration}ms`,
						);
					} else if (FullConfig.autoRetry) {
						ErrorCount++;
						await TelemetryService.log(
							"warn",
							`[MountainSync] Sync failed, will retry: ${Result.error?.message}`,
						);
					}
				} catch (error) {
					// ErrorCount++ but continue
					ErrorCount++;
				}
			}, FullConfig.syncIntervalMs);
		},

		stop: async () => {
			if (SyncTimer) {
				clearInterval(SyncTimer);
				SyncTimer = null;
				SyncStatus = "idle";
				await TelemetryService.log(
					"info",
					"[MountainSync] Stopped",
				);
			}
		},

		syncNow: () => SyncNowEffect(Mountain, IPC, TelemetryService),

		getStatus: async () => SyncStatus,

		getStats: async () => ({
			lastSyncTime: LastSyncTime,
			syncCount: SyncCount,
			successCount: SuccessCount,
			errorCount: ErrorCount,
			itemsSynced: ItemsSynced,
		}),

		pause: async () => {
			SyncStatus = "paused";
			await TelemetryService.log(
				"info",
				"[MountainSync] Pausing...",
			);
		},

		resume: async () => {
			SyncStatus = "syncing";
			await TelemetryService.log(
				"info",
				"[MountainSync] Resuming...",
			);
		},
	};
};

export default makeMountainSync;
