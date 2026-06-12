/**
 * @module Effect/Sidebar/Error/SidebarUpdateError
 * @description
 * Error thrown when updating a sidebar panel fails.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Usage context
 * @see {@link Effect/Sidebar/Error/SidebarPanelNotFoundError} Panel not found error
 * @category Error
 */

/**
 * Error thrown when attempting to update a sidebar panel and the operation fails.
 * Includes the panel ID and the underlying cause of the failure.
 */
export default class SidebarUpdateError extends Error {

	readonly _tag = "SidebarUpdateError";

	override readonly cause: unknown;

	constructor(panelId: string, cause: unknown) {
		super(`Failed to update sidebar panel '${panelId}': ${String(cause)}`);

		this.cause = cause;

		Object.setPrototypeOf(this, SidebarUpdateError.prototype);
	}

	override get name() {
		return "SidebarUpdateError";
	}
}
