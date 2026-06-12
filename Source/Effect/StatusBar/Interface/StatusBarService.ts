/**
 * @module Effect/StatusBar/Interface/StatusBarService
 * @description
 * Service interface for StatusBar management.
 * Provides methods to manage VSCode status bar items.
 * @see {@link Effect/StatusBar/Type/StatusBarType} Type definitions
 * @see {@link Effect/StatusBar/Layer/StatusBarLive} Live implementation
 * @category Interface
 */

import type StatusBarItemNotFoundError from "../Error/StatusBarItemNotFoundError.js";
import type StatusBarUpdateError from "../Error/StatusBarUpdateError.js";
import type {
	CreateStatusBarItem,
	StatusBarItem,
} from "../Type/StatusBarType.js";

/**
 * StatusBar service interface for managing VSCode status bar items.
 * Provides CRUD operations and stream-based reactivity.
 */
export interface StatusBarService {
	/** Create a new status bar item with auto-generated ID */
	readonly createItem: (
		item: CreateStatusBarItem,
	) => StatusBarItem;

	/** Update an existing status bar item */
	readonly updateItem: (
		id: string,

		updates: Partial<Omit<StatusBarItem, "id">>,
	) => void;

	/** Remove a status bar item */
	readonly removeItem: (
		id: string,
	) => void;

	/** Get a specific status bar item by ID */
	readonly getItem: (
		id: string,
	) => StatusBarItem | undefined;

	/** Get all status bar items */
	readonly items: ReadonlyArray<StatusBarItem>;

	/** Subscribe to status bar item changes for reactive updates */
	readonly onItemsChanges: (listener: (items: ReadonlyArray<StatusBarItem>) => void) => () => void;

	/** Set the visibility of a status bar item */
	readonly setItemVisibility: (
		id: string,

		visible: boolean,
	) => void;

	/** Get the text of a status bar item */
	readonly getItemText: (
		id: string,
	) => string | undefined;

	/** Set the text of a status bar item */
	readonly setItemText: (
		id: string,

		text: string,
	) => void;
}
