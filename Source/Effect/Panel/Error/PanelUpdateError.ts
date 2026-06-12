/**
 * @module Effect/Panel/Error/PanelUpdateError
 * @description
 * Error thrown when updating a panel view fails.
 * @see {@link Effect/Panel/Interface/PanelService} Usage context
 * @see {@link Effect/Panel/Error/PanelViewNotFoundError} View not found error
 * @category Error
 */

/**
 * Error thrown when attempting to update a panel view and the operation fails.
 * Includes the view ID and the underlying cause of the failure.
 */
export default class PanelUpdateError extends Error {
	readonly _tag = "PanelUpdateError";

	override readonly cause: unknown;

	constructor(viewId: string, cause: unknown) {
		super(`Failed to update panel view '${viewId}': ${String(cause)}`);

		this.cause = cause;

		Object.setPrototypeOf(this, PanelUpdateError.prototype);
	}

	override get name() {
		return "PanelUpdateError";
	}
}
