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
 * import { MountainLive } from "./Effect/Mountain.js";
 *
 * // New (recommended):
 * import { MountainLive } from "./Effect/Mountain/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	MountainConnectionError,
	MountainRPCError,
	MountainSyncError,
	MountainStateError,
	type MountainConnectionState,
	type SyncResource,
	type SyncResult,
	type MountainService,
	type MountainTag,
	type Mountain,
	CreateMountainService,
	MountainLive,
	MountainMockLive,
} from "./Mountain/index.js";
