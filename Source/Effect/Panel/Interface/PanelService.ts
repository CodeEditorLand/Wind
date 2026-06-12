/**
 * @module Effect/Panel/Interface/PanelService
 * @description
 * Service interface for Panel management.
 * Provides methods to manage bottom panel views in VSCode.
 * @see {@link Effect/Panel/Type/PanelType} Type definitions
 * @see {@link Effect/Panel/Layer/PanelLive} Implementation
 * @category Interface
 */

import type PanelUpdateError from "../Error/PanelUpdateError.js";
import type PanelViewNotFoundError from "../Error/PanelViewNotFoundError.js";
import type {
	CreatePanelView,
	PanelView,
	PanelViewType,
} from "../Type/PanelType.js";

/**
 * Panel service interface for managing bottom panel views.
 * Provides CRUD operations, visibility control, and stream-based reactivity.
 */
export interface PanelService {
	/** Create a new panel view with auto-generated ID */
	readonly createView: (
		view: CreatePanelView,
	) => PanelView;

	/** Update an existing panel view */
	readonly updateView: (
		id: string,

		updates: Partial<Omit<PanelView, "id">>,
	) => void;

	/** Remove a panel view */
	readonly removeView: (
		id: string,
	) => void;

	/** Get a specific panel view by ID */
	readonly getView: (
		id: string,
	) => PanelView | undefined;

	/** Get all panel views */
	readonly views: ReadonlyArray<PanelView>;

	/** Subscribe to panel view changes for reactive updates */
	readonly onViewsChanges: (listener: (views: ReadonlyArray<PanelView>) => void) => () => void;

	/** Set the active (focused) panel view */
	readonly setActiveView: (
		id: string,
	) => void;

	/** Get the currently active panel view ID */
	readonly getActiveView: string | undefined;

	/** Subscribe to active view changes for reactive updates */
	readonly onActiveViewChanges: (listener: (id: string | undefined) => void) => () => void;

	/** Show a panel view */
	readonly showView: (
		id: string,
	) => void;

	/** Hide a panel view */
	readonly hideView: (
		id: string,
	) => void;

	/** Toggle a panel view's visibility */
	readonly toggleView: (
		id: string,
	) => void;

	/** Maximize a panel view to take full height */
	readonly maximizeView: (
		id: string,
	) => void;

	/** Restore a panel view from maximized state */
	readonly restoreView: (
		id: string,
	) => void;

	/** Get views by type filter */
	readonly getViewsByType: (
		type: PanelViewType,
	) => ReadonlyArray<PanelView>;

	/** Get all visible panel views */
	readonly getVisibleViews: ReadonlyArray<PanelView>;

	/** Get the currently maximized panel view */
	readonly getMaximizedView: PanelView | undefined;
}
