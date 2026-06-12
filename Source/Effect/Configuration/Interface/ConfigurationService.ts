/**
 * @module Effect/Configuration/Interface/ConfigurationService
 * @description
 * Service interface for configuration management.
 * Provides methods to fetch, validate, apply, and react to configuration changes.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Default implementation
 * @category Interface
 */

import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Handle returned by subscription methods; call `dispose` to unsubscribe.
 */
export interface IDisposable {
	readonly dispose: () => void;
}

/**
 * Service interface for Configuration operations.
 * Manages configuration fetching, validation, and reactive updates.
 */
export interface ConfigurationService {
	/**
	 * Get current configuration snapshot.
	 * @throws ConfigurationNotReadyError when no configuration is loaded yet
	 */
	readonly get: () => ISandboxConfiguration;

	/**
	 * Fetch configuration from backend.
	 * @throws ConfigFetchError when both sandbox and IPC fetch fail
	 */
	readonly fetch: () => Promise<ISandboxConfiguration>;

	/**
	 * Validate configuration structure.
	 * @param Config - The configuration to validate
	 * @throws ConfigValidationError when the structure is invalid
	 */
	readonly validate: (Config: unknown) => ISandboxConfiguration;

	/**
	 * Apply configuration (zoom, userEnv, etc.).
	 * @param Config - The configuration to apply
	 * @throws ConfigApplyError when a setting cannot be applied
	 */
	readonly apply: (Config: ISandboxConfiguration) => void;

	/**
	 * Replace the current configuration snapshot and notify listeners.
	 * @param Config - The new configuration
	 */
	readonly replace: (Config: ISandboxConfiguration) => void;

	/**
	 * Subscribe to configuration changes.
	 * @param Listener - Called with the new configuration on every change
	 */
	readonly onChange: (
		Listener: (Config: ISandboxConfiguration) => void,
	) => IDisposable;

	/**
	 * Force refresh configuration from backend.
	 * @throws ConfigFetchError when the fetch fails
	 */
	readonly refresh: () => Promise<ISandboxConfiguration>;
}
