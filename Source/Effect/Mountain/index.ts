/**
 * @module Effect/Mountain
 * @description
 * Main re-export module for Mountain service.
 * Provides atomic exports for Mountain backend integration.
 *
 * @example
 * ```ts
 * import { MountainLive } from "./Effect/Mountain/index.js";
 *
 * await MountainLive.connect();
 *
 * const Version = await MountainLive.version();
 *
 * const Subscription = MountainLive.onConnectionChange((State) => {
 * 	// react to connection state changes
 * });
 *
 * Subscription.dispose();
 * ```
 *
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see {@link Effect/Mountain/Implementation/MountainImplementation} Live implementation
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
export type {
	IDisposable,
	MountainService,
} from "./Interface/MountainService.js";

// Service type alias (former Context.Tag; consumers use the live object)
export type { MountainTag } from "./Tag/MountainTag.js";

export type { MountainTag as Mountain } from "./Tag/MountainTag.js";

// Live implementation
export {
	CreateMountainService,
	MountainLive,
} from "./Implementation/MountainImplementation.js";

// Mock implementation
export { MountainMockLive } from "./Layer/MountainMock.js";
