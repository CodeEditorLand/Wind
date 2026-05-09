/**
 * @module Effect/Mountain/Error/MountainStateError
 * @description
 * Error thrown when Mountain state is invalid.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class MountainStateError extends Error {
	readonly _tag = "MountainStateError";

	readonly expected: string;

	readonly actual: string;

	constructor(expected: string, actual: string) {
		super(`Mountain state error: expected ${expected}, got ${actual}`);

		this.expected = expected;

		this.actual = actual;
	}
}

export default MountainStateError;
