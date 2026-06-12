/**
 * @module Types/Error/ConfigurationNotReadyError
 * @description
 * Error thrown when sandbox configuration has not been resolved yet.
 * Occurs when attempting to access configuration before it's fetched from preload.
 * @category Error
 */

/**
 * Configuration not ready error
 */
export class ConfigurationNotReadyError extends Error {

	readonly _tag = "ConfigurationNotReadyError";

	constructor() {
		super("Configuration not yet resolved from preload");
	}
}
