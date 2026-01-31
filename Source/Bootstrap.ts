/**
 * @module Bootstrap
 * @description
 * Main entry point for Wind's atomic bootstrap system.
 * Orchestrates the staged initialization of VSCode-compatible workbench environment.
 *
 * Architecture Overview:
 * ---------------------
 * This module is the top-level bootstrap coordinator that manages the complete
 * initialization lifecycle of Wind's VSCode-compatible environment. It provides
 * a flexible, debuggable, and atomic system for startup orchestration.
 *
 * Lifecycle:
 * 1. Acquire bootstrap configuration from window context and environment
 * 2. Initialize bootstrap orchestrator with debug/profiling options
 * 3. Execute staged initialization (Preload → Environment → Workbench → Activation)
 * 4. Handle errors gracefully with recovery and fallback mechanisms
 * 5. Report bootstrap metrics and performance data
 * 6. Dispatch completion events for downstream systems
 *
 * Key Responsibilities:
 * ---------------------
 * - Parse and validate bootstrap configuration from window context
 * - Initialize atomic bootstrap orchestrator with proper options
 * - Coordinate multi-stage initialization sequence
 * - Provide comprehensive error handling and recovery
 * - Support debug/profiling modes for development
 * - Report performance metrics and initialization timing
 * - Dispatch events for workbench and extensions to consume
 * - Implement graceful degradation for failed stages
 *
 * Microsoft VSCode Source References:
 * -----------------------------------
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/code/browser/workbench/workbench.html
 *   HTML entry point that loads bootstrap
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/bootstrap.js
 *   Electron bootstrap implementation
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/code/electron-main/bootstrap.js
 *   Main process bootstrap orchestrator
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/common/sandboxTypes.ts
 *   Configuration types for sandboxed environment
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/common/lifecycle.ts
 *   Disposable patterns for resource management
 *
 * TODOs for Missing Functionality:
 * --------------------------------
 * - TODO: Implement bootstrap caching to speed up subsequent launches
 * - TODO: Add support for incremental bootstrap updates (hot reload)
 * - TODO: Implement bootstrap telemetry integration with Mountain
 * - TODO: Add support for custom bootstrap stage ordering
 * - TODO: Implement parallel stage execution where safe
 * - TODO: Add bootstrap performance regression detection
 * - TODO: Support remote bootstrap scenarios (Extension Host in Cocoon)
 * - TODO: Implement bootstrap recovery checkpoints
 * - TODO: Add support for bootstrap configuration presets
 * - TODO: Implement bootstrap health monitoring
 * - TODO: Add support for A/B testing bootstrap strategies
 * - TODO: Implement bootstrap rollback on critical failures
 * - TODO: Add detailed bootstrap diagnostics export
 * - TODO: Support bootstrap profiling with Chrome DevTools
 * - TODO: Implement bootstrap timeout handling per stage
 * - TODO: Add support for conditional stage execution
 *
 * Connections to Other Elements:
 * ------------------------------
 * - Mountain: Backend gRPC service for configuration and metrics
 * - Sky: UI integration through bootstrap completion events
 * - Cocoon: Extension host bootstrap coordination
 * - Air: Build system integration for development workflow
 *
 * Debug Mode:
 * -----------
 * Enable debug mode by setting `window.__BOOTSTRAP_DEBUG__` to true before loading.
 * This enables verbose logging, stage pausing, and detailed performance metrics.
 *
 * @see Preload.ts for initialization of window.vscode environment
 * @see BootstrapOrchestrator.ts (handled by T8) for staging orchestration
 * @see Bootstrap/Stages/*.ts for individual stage implementations
 */

import { bootstrap } from './Bootstrap/index.js';

// ============================================================================
// BOOTSTRAP CONFIGURATION
// ============================================================================

/**
 * Retrieves debug flag from window context
 * Enables verbose logging and additional checks when enabled
 *
 * @returns True if debug mode is enabled
 */
function GetDebugMode(): boolean {
	try {
		return Boolean((window as any).__BOOTSTRAP_DEBUG__);
	} catch {
		return false;
	}
}

/**
 * Retrieves verbose logging flag from window context
 * When enabled, all bootstrap operations are logged in detail
 *
 * @returns True if verbose logging is enabled
 */
function GetVerboseLogging(): boolean {
	try {
		return Boolean((window as any).__VERBOSE_LOGGING__ || (window as any).__BOOTSTRAP_DEBUG__);
	} catch {
		return false;
	}
}

/**
 * Retrieves pause-between-stages flag from window context
 * Useful for debugging and understanding initialization sequence
 *
 * @returns True if pausing between stages is enabled
 */
function GetPauseBetweenStages(): boolean {
	try {
		return Boolean((window as any).__PAUSE_BETWEEN_STAGES__ || (window as any).__BOOTSTRAP_DEBUG__);
	} catch {
		return false;
	}
}

/**
 * Builds bootstrap options from window context and environment
 * Combines debug flags with runtime configuration
 *
 * @returns Complete bootstrap configuration object
 */
function BuildBootstrapOptions() {
	const debugMode = GetDebugMode();
	const verboseLogging = GetVerboseLogging();
	const pauseBetweenStages = GetPauseBetweenStages();

	return {
		// Debug and logging options
		debugMode,
		verboseLogging,
		showStatusUI: true,
		pauseBetweenStages: PauseBetweenStages,
		enablePerformanceTracking: true,

		// Performance tracking
		trackMemoryUsage: DebugMode,
		enableProfiling: DebugMode,

		// Error handling
		enableErrorRecovery: true,
		reportErrorsToBackend: true,

		// UI integration
		showProgressBar: !DebugMode,
		logToConsole: true,

		// Development options
		enableLiveReload: !DebugMode && (window as any).__LIVE_RELOAD__ || false,

		// TODO: Add more configurable options as needed
	};
}

// ============================================================================
// BOOTSTRAP ENTRY POINT
// ============================================================================

/**
 * Main bootstrap initialization function
 * Orchestrates the complete VSCode-compatible environment startup
 */
 async function InitializeBootstrap(): Promise<void> {
	try {
		console.log('[Wind Bootstrap] ===============================================');
		console.log('[Wind Bootstrap] Atomic bootstrap system starting...');
		console.log('[Wind Bootstrap] ===============================================');

		// Build configuration from context and environment
		const options = BuildBootstrapOptions();

		if (options.debugMode) {
			console.log('[Wind Bootstrap] Debug mode enabled');
			console.log('[Wind Bootstrap] Options:', options);
		}

		// Start the bootstrap process through orchestrator
		// This is handled by the atomic bootstrap system in Bootstrap/index.js
		const result = await bootstrap(options);

		// Report bootstrap completion results
		console.log('[Wind Bootstrap] ===============================================');
		console.log('[Wind Bootstrap] Bootstrap process completed');
		console.log('[Wind Bootstrap] Success:', result.success);
		console.log('[Wind Bootstrap] Duration:', result.totalDuration.toFixed(0), 'ms');
		console.log('[Wind Bootstrap] Stages completed:', result.completedStages?.length || 0);

		if (result.success) {
			console.log('[Wind Bootstrap] ✓ All stages completed successfully');
			console.log('[Wind Bootstrap] ✓ Environment ready for VSCode workbench');

			// Dispatch successful bootstrap event
			window.dispatchEvent(new CustomEvent('vscode-wind-bootstrap-complete', {
				detail: {
					success: true,
					duration: result.totalDuration,
					stages: result.completedStages
				}
			}));

		} else {
			console.error('[Wind Bootstrap] ✗ Bootstrap failed');
			if (result.error) {
				console.error('[Wind Bootstrap] Error:', result.error);
			}
			if (result.failedStages && result.failedStages.length > 0) {
				console.error('[Wind Bootstrap] Failed stages:', result.failedStages);
			}

			// Dispatch failed bootstrap event
			window.dispatchEvent(new CustomEvent('vscode-wind-bootstrap-failed', {
				detail: {
					success: false,
					duration: result.totalDuration,
					error: result.error,
					failedStages: result.failedStages
				}
			}));
		}

		console.log('[Wind Bootstrap] ===============================================');

	} catch (error) {
		// Handle uncaught bootstrap errors
		console.error('[Wind Bootstrap] ===============================================');
		console.error('[Wind Bootstrap] ✗ Fatal bootstrap error:');
		console.error('[Wind Bootstrap]', error instanceof Error ? error.message : String(error));
		if (error instanceof Error && error.stack) {
			console.error('[Wind Bootstrap]', error.stack);
		}
		console.error('[Wind Bootstrap] ===============================================');

		// Dispatch fatal error event
		window.dispatchEvent(new CustomEvent('vscode-wind-bootstrap-error', {
			detail: {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined
			}
		}));

		// Show error in UI
		ShowBootstrapError(error instanceof Error ? error : new Error(String(error)));
	}
}

/**
 * Displays bootstrap error in the webview UI
 * Helps developers diagnose bootstrap failures
 *
 * @param error - The error to display
 */
function ShowBootstrapError(error: Error): void {
	try {
		const errorDiv = document.createElement('div');
		errorDiv.innerHTML = `
			<div style="
				color: #d32f2f;
				padding: 20px;
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				font-size: 14px;
				background: #ffebee;
				border: 1px solid #ffcdd2;
				border-radius: 4px;
				margin: 20px;
				max-width: 800px;
				margin-left: auto;
				margin-right: auto;
			">
				<h2 style="margin: 0 0 10px 0; font-size: 18px;">Wind Bootstrap Error</h2>
				<p style="margin: 10px 0; white-space: pre-wrap;">${escapeHtml(error.message)}</p>
				${error.stack ? `<pre style="margin: 10px 0; font-size: 12px; overflow-x: auto;">${escapeHtml(error.stack)}</pre>` : ''}
				<p style="margin: 10px 0; font-size: 12px; opacity: 0.8;">
					Initialization failed. Please check the browser console for detailed information.
				</p>
			</div>
		`;

		// Add error to DOM when ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				document.body.prepend(errorDiv);
			});
		} else {
			document.body.prepend(errorDiv);
		}

	} catch (uiError) {
		// If error display fails, log to console
		console.error('[Wind Bootstrap] Failed to display bootstrap error:', uiError);
	}
}

/**
 * Escapes HTML special characters to prevent XSS
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML rendering
 */
function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

// ============================================================================
// START BOOTSTRAP
// ============================================================================

console.log('[Wind Bootstrap] Bootstrap entry point loaded');

// Start initialization
// Wait for preload to complete first (window.vscode available)
function WaitForPreloadAndInitialize(): void {
	if ((window as any).vscode) {
		// Preload is ready, start bootstrap
		InitializeBootstrap();
	} else {
		// Wait for preload to complete
		console.log('[Wind Bootstrap] Waiting for preload to initialize...');

		const checkPreload = setInterval(() => {
			if ((window as any).vscode) {
				clearInterval(checkPreload);
				console.log('[Wind Bootstrap] Preload detected, starting bootstrap...');
				InitializeBootstrap();
			}
		}, 50);

		// Timeout after 10 seconds
		setTimeout(() => {
			clearInterval(checkPreload);
			console.warn('[Wind Bootstrap] Preload timeout, starting bootstrap anyway...');
			InitializeBootstrap();
		}, 10000);
	}
}

// Start the wait loop
WaitForPreloadAndInitialize();
