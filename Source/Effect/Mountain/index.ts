// Convenience alias for backward compatibility
import { MountainTag } from "./Tag/MountainTag.js";

/**
 * @module Effect/Mountain
 * @description
 * Main re-export module for Mountain service.
 * Provides atomic exports for Mountain backend integration.
 *
 * @example
 * ```ts
 * import { Mountain, MountainLive, MountainTag } from "./Effect/Mountain/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const mountain = yield* MountainTag;
 *   const version = yield* mountain.version;
 *   return version;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(MountainLive));
 * ```
 *
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */

// Error types
export { default as MountainConnectionError } from "./Error/MountainConnectionError.js";

export { default as MountainRPCError } from "./Error/MountainRPCError.js";

export { default as MountainSyncError } from "./Error/MountainSyncError.js";

export { default as MountainStateError } from "./Error/MountainStateError.js";

// Type definitions
export type {
	MountainConnectionState,
	SyncResource,
	SyncResult,
} from "./Type/MountainType.js";

// Service interface
export type { MountainService } from "./Interface/MountainService.js";

// Service tag
export { MountainTag } from "./Tag/MountainTag.js";

// Live implementation layer
export { MountainLive } from "./Implementation/MountainImplementation.js";

// Mock implementation layer
export { MountainMockLive } from "./Layer/MountainMock.js";

export { MountainTag as Mountain };
