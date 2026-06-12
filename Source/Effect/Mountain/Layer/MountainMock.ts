/**
 * @module Effect/Mountain/Layer/MountainMock
 * @description
 * Mock implementation for Mountain service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Live implementation
 * @category Layer
 */

import type { MountainService } from "../Interface/MountainService.js";
import type { SyncResult } from "../Type/MountainType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Mock Mountain service instance.
 * Provides simple no-op implementation for testing.
 */
export const MountainMockLive: MountainService = {
	connectionState: () => ({
		_tag: "Connected" as const,
		version: "mock",
	}),

	onConnectionChange: () => ({ dispose: () => undefined }),

	connect: async () => undefined,

	disconnect: () => undefined,

	rpc:
		<T>() =>
		async () =>
			({}) as T,

	sync: async () =>
		({
			success: true,
			resourcesSynced: 0,
			errors: [],
			duration: 0,
		}) satisfies SyncResult,

	onSyncEvent: () => ({ dispose: () => undefined }),

	version: async () => "mock",

	healthCheck: async () => true,

	dispose: () => undefined,
} satisfies MountainService;

export default MountainMockLive;
