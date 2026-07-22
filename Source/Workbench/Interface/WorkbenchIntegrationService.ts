/**
 * @module Workbench/Interface/WorkbenchIntegrationService
 * @description
 * Service interface for VSCode browser workbench integration.
 * Manages the integration of Mountain file system provider with VSCode's workbench.
 * All operations are plain sync/async; failures throw `WorkbenchIntegrationError`.
 * @see {@link Workbench/Implementation/WorkbenchIntegrationImplementation} Default implementation
 * @category Interface
 */

import type { IDisposable } from "../../FileSystem/Type/FileSystemType.js";

import type {
	ProviderRegistrationResult,
	WorkbenchDiagnostics,
	WorkbenchInitState,
	WorkbenchIntegrationConfig,
	WorkspaceContext,
} from "../Type/WorkbenchIntegrationType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Service interface for VSCode workbench integration.
 * Manages the lifecycle of integrating Mountain's file system provider with VSCode.
 */
export interface WorkbenchIntegrationService {

	/**
	 * Initialize workbench integration.
	 * Waits for workbench to be ready, unregisters default providers,
	 * and registers Mountain file system provider.
	 * @param config - Integration configuration
	 * @returns Promise that resolves when integration is initialized
	 * @throws WorkbenchIntegrationError
	 */
	readonly initialize: (config: WorkbenchIntegrationConfig) => Promise<void>;

	/**
	 * Get current workbench initialization state.
	 * @returns Current state
	 */
	readonly getState: () => WorkbenchInitState;

	/**
	 * Subscribe to workbench state changes.
	 * @param listener - Callback invoked with each new state
	 * @returns Disposable that removes the listener
	 */
	readonly onStateChange: (
		listener: (state: WorkbenchInitState) => void,
	) => IDisposable;

	/**
	 * Register Mountain file system provider with VSCode workbench.
	 * @param scheme - File scheme to register (e.g., "file")
	 * @returns Registration result
	 * @throws WorkbenchIntegrationError
	 */
	readonly registerProvider: (scheme: string) => ProviderRegistrationResult;

	/**
	 * Unregister VSCode's default file system providers.
	 * Optional step before registering Mountain provider.
	 * @throws WorkbenchIntegrationError
	 */
	readonly unregisterDefaultProviders: () => void;

	/**
	 * Configure workspace for VSCode workbench.
	 * Sets up workspace root, folders, and configuration from Mountain.
	 * @param workspaceContext - Workspace configuration
	 * @throws WorkbenchIntegrationError
	 */
	readonly configureWorkspace: (workspaceContext: WorkspaceContext) => void;

	/**
	 * Get diagnostics about the current integration state.
	 * Useful for debugging and monitoring.
	 * @returns Diagnostic information
	 */
	readonly getDiagnostics: () => WorkbenchDiagnostics;

	/**
	 * Check if workbench is ready for integration.
	 * Returns true when VSCode APIs and service collection are available.
	 * @returns Whether the workbench is ready
	 */
	readonly isWorkbenchReady: () => boolean;

	/**
	 * Reset workbench integration state.
	 * Clears all registered providers and resets to initial state.
	 * @throws WorkbenchIntegrationError
	 */
	readonly reset: () => void;

	/**
	 * Wait for workbench to be ready.
	 * Polls until workbench APIs are available or timeout is reached.
	 * @param timeout - Maximum time to wait in milliseconds
	 * @returns Promise that resolves when workbench is ready
	 * @throws WorkbenchIntegrationError
	 */
	readonly waitForWorkbench: (timeout: number) => Promise<void>;
}
