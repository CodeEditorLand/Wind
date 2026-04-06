/**
 * @module Effect/ActivityBar/Error/ActivityBarUpdateError
 * @description
 * Error thrown when an activity bar item update fails.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class ActivityBarUpdateError extends Error {
	readonly _tag = "ActivityBarUpdateError";
	constructor(itemId: string, cause: unknown) {
		super(
			`Failed to update activity bar item '${itemId}': ${String(cause)}`,
		);
		this.cause = cause;
		Object.setPrototypeOf(this, ActivityBarUpdateError.prototype);
	}
	override get name() {
		return "ActivityBarUpdateError";
	}
}

export default ActivityBarUpdateError;
