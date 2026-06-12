/**
 * @module Effect/StatusBar/Error/StatusBarItemNotFoundError
 * @description
 * Error thrown when a requested status bar item cannot be found.
 * @see {@link Effect/StatusBar/Interface/StatusBarService} Usage context
 * @see {@link Effect/StatusBar/Error/StatusBarUpdateError} Update error
 * @category Error
 */

/**
 * Error thrown when attempting to access or modify a status bar item that doesn't exist.
 * Includes the item ID that was not found.
 */
export default class StatusBarItemNotFoundError extends Error {

	readonly _tag = "StatusBarItemNotFoundError";

	constructor(readonly itemId: string) {
		super(`Status bar item '${itemId}' not found`);

		Object.setPrototypeOf(this, StatusBarItemNotFoundError.prototype);
	}

	override get name() {
		return "StatusBarItemNotFoundError";
	}
}
