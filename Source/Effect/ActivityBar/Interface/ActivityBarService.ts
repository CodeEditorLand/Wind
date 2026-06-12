/**
 * @module Effect/ActivityBar/Interface/ActivityBarService
 * @description
 * Service interface for managing activity bar items, their display, and active state.
 * Provides methods to create, update, remove, and query activity bar items.
 * @see {@link Effect/ActivityBar/Implementation/ActivityBarImplementation} Default implementation
 * @see {@link Effect/ActivityBar/Type/ActivityBarType} Type definitions
 * @category Interface
 */

import type {
	ActivityBarBadge,
	ActivityBarItem,
	CreateActivityBarItem,
} from "../Type/ActivityBarType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Service interface for Activity Bar operations.
 * Manages activity bar items, their display state, badges, and active item.
 *
 * Mutators throw {@link Effect/ActivityBar/Error/ActivityBarItemNotFoundError}
 * or {@link Effect/ActivityBar/Error/ActivityBarUpdateError} on failure.
 */
export interface ActivityBarService {
	/**
	 * Create a new activity bar item.
	 * @param item - The item data (without id, which is auto-generated)
	 * @returns The created activity bar item with generated id
	 */
	readonly createItem: (item: CreateActivityBarItem) => ActivityBarItem;

	/**
	 * Update an existing activity bar item.
	 * @param id - The item id to update
	 * @param updates - Partial updates to apply
	 */
	readonly updateItem: (
		id: string,

		updates: Partial<Omit<ActivityBarItem, "id">>,
	) => void;

	/**
	 * Remove an activity bar item.
	 * @param id - The item id to remove
	 */
	readonly removeItem: (id: string) => void;

	/**
	 * Get a specific activity bar item by ID.
	 * @param id - The item id to retrieve
	 * @returns The item or undefined if not found
	 */
	readonly getItem: (id: string) => ActivityBarItem | undefined;

	/**
	 * Get all activity bar items.
	 * @returns Readonly array of all activity bar items
	 */
	readonly items: () => ReadonlyArray<ActivityBarItem>;

	/**
	 * Set the active activity bar item.
	 * @param id - The item id to set as active
	 */
	readonly setActiveItem: (id: string) => void;

	/**
	 * Get the currently active activity bar item ID.
	 * @returns The active item id or undefined if none is active
	 */
	readonly getActiveItem: () => string | undefined;

	/**
	 * Set badge for an activity bar item.
	 * @param id - The item id to set badge on
	 * @param badge - The badge to set, or undefined to clear
	 */
	readonly setBadge: (
		id: string,

		badge: ActivityBarBadge | undefined,
	) => void;

	/**
	 * Get badge for an activity bar item.
	 * @param id - The item id to get badge from
	 * @returns The badge or undefined if not set
	 */
	readonly getBadge: (id: string) => ActivityBarBadge | undefined;

	/**
	 * Clear badge for an activity bar item.
	 * @param id - The item id to clear badge from
	 */
	readonly clearBadge: (id: string) => void;
}
