/**
 * @module Effect/MountainSync/Layer/MountainSyncMock
 * @description
 * Mock layer for MountainSync service.
 * Provides a no-op implementation suitable for testing.
 * @see {@link Effect/MountainSync/Layer/MountainSyncLive} Live layer
 * @see {@link Effect/MountainSync/Interface/MountainSyncService} Service interface
 * @category Layer
 */

import { Effect, Layer } from "effect";
import MountainSyncTag from "../Tag/MountainSyncTag.js";
import type { SyncStats } from "../Type/MountainSyncType.js";
import type { MountainSyncResult } from "../Type/MountainSyncType.js";

/**
 * Creates a mock MountainSync service implementation.
 * All operations return static values suitable for testing.
 *
 * @returns Mock MountainSync service instance
 */
const makeMockMountainSync = () => ({
	start: () => Effect.void,
	stop: () => Effect.void,
	syncNow: () =>
		Effect.gen(function* () {
			return {
				success: true,
				itemsSynced: 0,
				duration: 1,
			} satisfies MountainSyncResult;
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

/**
 * Mock layer for MountainSync service.
 * Provides a no-op implementation for testing without dependencies.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { MountainSyncMock } from "./Effect/MountainSync/Layer/MountainSyncMock.js";
 *
 * const testLayer = MountainSyncMock;
 * ```
 */
const MountainSyncMock = Layer.effect(MountainSyncTag, Effect.succeed(makeMockMountainSync()));

export default MountainSyncMock;
export { makeMockMountainSync };
