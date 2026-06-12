/**
 * @module Effect/ActivityBar
 * @description
 * Main re-export module for ActivityBar service.
 * Provides atomic exports for activity bar item management.
 *
 * @example
 * ```ts
 * import { ActivityBarLive } from "./Effect/ActivityBar/index.js";
 *
 * const Item = ActivityBarLive.createItem({
 * 	title: "Explorer",
 * 	icon: "files",
 * 	command: "workbench.view.explorer",
 * 	position: 0,
 * });
 * ```
 *
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Live implementation
 * @category Service
 */

// Error types
export { default as ActivityBarItemNotFoundError } from "./Error/ActivityBarItemNotFoundError.js";

export { default as ActivityBarUpdateError } from "./Error/ActivityBarUpdateError.js";

// Type definitions
export type {
	ActivityBarBadge,
	ActivityBarItem,
	CreateActivityBarItem,
} from "./Type/ActivityBarType.js";

// Service interface
export type { ActivityBarService } from "./Interface/ActivityBarService.js";

// Helper functions
export { GenerateItemId } from "./Implementation/ActivityBarHelper.js";

// Live implementation
export {
	ActivityBarLive,
	makeActivityBar,
} from "./Implementation/ActivityBarImplementation.js";

// Mock implementation
export { ActivityBarMockLive } from "./Layer/ActivityBarMock.js";
