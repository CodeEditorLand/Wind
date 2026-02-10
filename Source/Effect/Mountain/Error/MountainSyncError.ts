/**
 * @module Effect/Mountain/Error/MountainSyncError
 * @description
 * Error thrown when Mountain sync operation fails.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

import { Context, Effect } from "effect";

// ============================================================================
// Error Definition
// ============================================================================

export class MountainSyncError extends Error {
	readonly _tag = "MountainSyncError";
	readonly resource: string;
	override readonly cause: unknown;
	constructor(resource: string, cause: unknown) {
		super(`Mountain sync for '${resource}' failed: ${String(cause)}`);
		this.resource = resource;
	}
}

export default MountainSyncError;
