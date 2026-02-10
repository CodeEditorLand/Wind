/**
 * @module Effect/Configuration/Error/ConfigFetchError
 * @description
 * Error thrown when configuration fetch fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

import { Context, Effect } from "effect";

// ============================================================================
// Error Definition
// ============================================================================

export class ConfigFetchError extends Error {
	readonly _tag = "ConfigFetchError";
	constructor(override readonly cause: unknown) {
		super(`Failed to fetch configuration: ${String(cause)}`);
	}
}

export default ConfigFetchError;
