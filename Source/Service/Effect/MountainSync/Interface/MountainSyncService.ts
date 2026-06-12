/**
 * @module Effect/MountainSync/Interface/MountainSyncService
 * @description
 * Service interface for Mountain-Wind synchronization.
 * Provides methods to control background sync operations between Mountain and Wind.
 * @see {@link Effect/MountainSync/Type/MountainSyncType} Type definitions
 * @see {@link Effect/MountainSync/Implementation/MountainSyncImplementation} Implementation
 * @category Interface
 */

import type {
	MountainSyncResult,
	SyncConfig,
	SyncStats,
} from "../Type/MountainSyncType.js";

/**
 * MountainSync service interface for managing background synchronization.
 * Provides full lifecycle management of sync operations including start,
 * stop, pause, resume, and on-demand sync capabilities.
 */
export interface MountainSyncService {
	/** Start automatic synchronization with optional configuration overrides */
	readonly start: (config?: Partial<SyncConfig>) => Promise<void>;

	/** Stop the background synchronization process */
	readonly stop: () => Promise<void>;

	/** Perform an immediate synchronization operation on demand */
	readonly syncNow: () => Promise<MountainSyncResult>;

	/** Get the current synchronization status */
	readonly getStatus: () => Promise<"idle" | "syncing" | "paused" | "error">;

	/** Get synchronization statistics and metrics */
	readonly getStats: () => Promise<SyncStats>;

	/** Pause the background synchronization process */
	readonly pause: () => Promise<void>;

	/** Resume a paused background synchronization process */
	readonly resume: () => Promise<void>;
}
