/**
 * @module Effect/MountainSync/Layer/MountainSyncMock
 * @description
 * Mock layer for MountainSync service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/MountainSync/Layer/MountainSyncLive} Live layer
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @category Layer
 */

import type {
	MountainSyncResult,
	SyncStats,
} from "../Type/MountainSyncType.js";

/**
 * Creates a mock MountainSync service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock MountainSync service instance
 */
const makeMockMountainSync = () => ({
	start: async () => {},
	stop: async () => {},
	syncNow: async () => {
		return {
			success: true,
			itemsSynced: 0,
			duration: 1,
		} satisfies MountainSyncResult;
	},
	getStatus: async () => "idle" as const,
	getStats: async () => ({
		lastSyncTime: Date.now(),
		syncCount: 0,
		successCount: 0,
		errorCount: 0,
		itemsSynced: 0,
	} satisfies SyncStats),
	pause: async () => {},
	resume: async () => {},
});

/**
 * Mock layer for MountainSync service.
 * Provides a no-op implementation for testing without dependencies.
 */
const MountainSyncMock = makeMockMountainSync();

export default MountainSyncMock;

export { makeMockMountainSync };
