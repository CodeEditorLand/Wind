/**
 * @module Effect/ActivityBar
 * @description
 * Main re-export module for ActivityBar service.
 * Provides atomic exports for activity bar item management.
 *
 * @example
 * ```ts
 * import { ActivityBar, ActivityBarLive, ActivityBarTag } from "./Effect/ActivityBar/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const activityBar = yield* ActivityBarTag;
 *   const items = yield* activityBar.items;
 *   return items;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(ActivityBarLive));
 * ```
 *
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */

// Error types
export { default as ActivityBarItemNotFoundError } from "./Error/ActivityBarItemNotFoundError.js";
export { default as ActivityBarUpdateError } from "./Error/ActivityBarUpdateError.js";

// Type definitions
export type { ActivityBarBadge, ActivityBarItem, CreateActivityBarItem } from "./Type/ActivityBarType.js";

// Service interface
export type { ActivityBarService } from "./Interface/ActivityBarService.js";

// Service tag
export { ActivityBarTag } from "./Tag/ActivityBarTag.js";

// Helper functions
export {
	MakeCreateItem,
	MakeUpdateItem,
	MakeRemoveItem,
	MakeGetItem,
	MakeSetActiveItem,
	MakeSetBadge,
	MakeGetBadge,
	GenerateItemId,
} from "./Implementation/ActivityBarHelper.js";

// Live implementation layer
export { ActivityBarLive } from "./Implementation/ActivityBarImplementation.js";

// Mock implementation layer
export { ActivityBarMockLive } from "./Layer/ActivityBarMock.js";

// Convenience alias for backward compatibility
import { ActivityBarTag } from "./Tag/ActivityBarTag.js";
export { ActivityBarTag as ActivityBar };
