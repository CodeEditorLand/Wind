/**
 * @module Effect/Configuration/Error/ConfigValidationError
 * @description
 * Error thrown when configuration validation fails.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface using this error
 * @see [Effect-TS Error Handling](https://effect.website/docs/guide/error-handling)
 * @category Error
 */

// ============================================================================
// Error Definition
// ============================================================================

export class ConfigValidationError extends Error {
	readonly _tag = "ConfigValidationError";
	constructor(readonly issues: ReadonlyArray<string>) {
		super(`Configuration validation failed: ${issues.join(", ")}`);
	}
}

export default ConfigValidationError;
