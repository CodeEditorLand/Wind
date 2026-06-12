/**
 * @module Effect/Mountain/Error/MountainRPCError
 * @description
 * Error thrown when Mountain RPC call fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class MountainRPCError extends Error {

	readonly _tag = "MountainRPCError";

	readonly method: string;

	override readonly cause: unknown;

	constructor(method: string, cause: unknown) {
		super(`Mountain RPC '${method}' failed: ${String(cause)}`);

		this.method = method;
	}
}

export default MountainRPCError;
