/**
 * @module Effect/Configuration/Error/ConfigApplyError
 * @description
 * Error thrown when configuration application fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class ConfigApplyError extends Error {
	readonly _tag = "ConfigApplyError";

	constructor(
		readonly key: string,

		override readonly cause: unknown,
	) {
		super(`Failed to apply configuration for '${key}': ${String(cause)}`);
	}
}

export default ConfigApplyError;
