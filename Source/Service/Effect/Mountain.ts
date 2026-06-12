/**
 * @module Effect/Mountain
 * @description
 * Atomic Mountain backend service.
 * Consolidates MountainIntegrationService and MountainWindSync into a single,
 * unified backend integration layer with proper error handling and resilience.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Mountain/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { MountainLive } from "./Service/Mountain.js";
 *
 * // New (recommended):
 * import { MountainLive } from "./Service/Mountain/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	CreateMountainService,
	type Mountain,
	MountainConnectionError,
	type MountainConnectionState,
	MountainLive,
	MountainMockLive,
	MountainRPCError,
	type MountainService,
	MountainStateError,
	MountainSyncError,
	type MountainTag,
	type SyncResource,
	type SyncResult,
} from "./Mountain/index.js";
