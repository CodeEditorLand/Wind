/**
 * @module Effect/ActivityBar
 * @description
 * Atomic Activity Bar service backed by a plain in-memory store.
 * Manages activity bar items, their display, and active state.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./ActivityBar/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { ActivityBarLive } from "./Effect/ActivityBar.js";
 *
 * // New (recommended):
 * import { ActivityBarLive } from "./Effect/ActivityBar/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	type ActivityBarBadge,
	type ActivityBarItem,
	ActivityBarItemNotFoundError,
	ActivityBarLive,
	ActivityBarMockLive,
	type ActivityBarService,
	ActivityBarUpdateError,
	type CreateActivityBarItem,
	GenerateItemId,
	makeActivityBar,
} from "./ActivityBar/index.js";
