/**
 * @module Effect/Mountain/Layer/MountainMock
 * @description
 * Mock implementation layer for Mountain service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import type { MountainService } from "../Interface/MountainService.js";
import { MountainTag } from "../Tag/MountainTag.js";
import type { SyncResult } from "../Type/MountainType.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Mock implementation layer for Mountain service.
 * Provides simple no-op implementation for testing.
 */
export const MountainMockLive = Layer.succeed(MountainTag, {
	connectionState: Effect.succeed({
		_tag: "Connected" as const,
		version: "mock",
	}),
	connectionChanges: Stream.empty,
	connect: Effect.void,
	disconnect: Effect.void,
	rpc: () => () => Effect.succeed({} as any),
	sync: () =>
		Effect.succeed({
			success: true,
			resourcesSynced: 0,
			errors: [],
			duration: 0,
		} satisfies SyncResult),
	syncEvents: Stream.empty,
	version: Effect.succeed("mock"),
	healthCheck: Effect.succeed(true),
} satisfies MountainService);

export default MountainMockLive;
