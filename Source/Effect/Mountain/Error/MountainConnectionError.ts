/**
 * @module Effect/Mountain/Error/MountainConnectionError
 * @description
 * Error thrown when connection to Mountain backend fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class MountainConnectionError extends Error {

	readonly _tag = "MountainConnectionError";

	override readonly cause: unknown;

	constructor(cause: unknown) {
		super(`Failed to connect to Mountain backend: ${String(cause)}`);
	}
}

export default MountainConnectionError;
