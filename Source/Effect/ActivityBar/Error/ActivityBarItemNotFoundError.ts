/**
 * @module Effect/ActivityBar/Error/ActivityBarItemNotFoundError
 * @description
 * Error thrown when an activity bar item cannot be found by its ID.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class ActivityBarItemNotFoundError extends Error {
	readonly _tag = "ActivityBarItemNotFoundError";
	constructor(itemId: string) {
		super(`Activity bar item '${itemId}' not found`);
		Object.setPrototypeOf(this, ActivityBarItemNotFoundError.prototype);
	}
	override get name() { return "ActivityBarItemNotFoundError"; }
}

export default ActivityBarItemNotFoundError;
