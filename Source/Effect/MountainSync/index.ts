/**
 * @module Effect/MountainSync
 * @description
 * Main re-export module for MountainSync service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @see {@link Effect/MountainSync/Layer/MountainSyncLive} Live layer
 * @see {@link Effect/MountainSync/Layer/MountainSyncMock} Mock layer
 * @category Re-export
 */

// Types
export type {
	SyncStatus,
	SyncConfig,
	SyncStats,
	MountainSyncResult,
} from "./Type/MountainSyncType.js";

// Service interface
export type { MountainSyncService } from "./Interface/MountainSyncService.js";

// Tag
export { default as MountainSyncTag } from "./Tag/MountainSyncTag.js";

// Layers
export { default as MountainSyncLive } from "./Layer/MountainSyncLive.js";

export { default as MountainSyncMock } from "./Layer/MountainSyncMock.js";

// Mock factory (for direct usage without Layer)
export { makeMockMountainSync } from "./Layer/MountainSyncMock.js";
