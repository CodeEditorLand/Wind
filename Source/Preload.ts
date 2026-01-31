/**
 * @module Preload
 * @description
 * Main preload script for Wind - creates VSCode-compatible environment in Tauri webview.
 * This script runs before all other page content and sets up the window.vscode API shim.
 *
 * Architecture Overview:
 * ---------------------
 * This preload script bridges the gap between Tauri's native backend (Mountain) and VSCode's
 * frontend framework. It provides the essential APIs that VSCode expects from Electron,
 * implemented through Tauri-compatible alternatives.
 *
 * Lifecycle:
 * 1. Execute immediately when webview loads (before DOMContentLoaded)
 * 2. Establish IPC communication bridge with Mountain backend
 * 3. Create Electron API shims (ipcRenderer, process, webFrame, etc.)
 * 4. Initialize window.vscode global object with sandbox globals
 * 5. Load bootstrap configuration and prepare for workbench initialization
 * 6. Dispatch 'vscode-wind-preload-ready' event to signal completion
 *
 * Key Responsibilities:
 * ---------------------
 * - Initialize VSCode sandbox environment in Tauri webview
 * - Create IElectronEnvironment-compatible API shims
 * - Establish secure IPC communication with Mountain gRPC backend
 * - Load and validate bootstrap configuration
 * - Provide window.vscode global for VSCode workbench
 * - Implement graceful degradation for missing dependencies
 * - Support remote development scenarios (Extension Host in Cocoon)
 *
 * Microsoft VSCode Source References:
 * -----------------------------------
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/electron-browser/electronTypes.ts
 *   Type definitions for IpcRenderer, IpcRendererEvent, and Electron APIs
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/common/sandboxTypes.ts
 *   ISandboxConfiguration interface for workbench configuration
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/electron-browser/globals.js
 *   IMainWindowSandboxGlobals and ISandboxNodeProcess interfaces
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/common/lifecycle.ts
 *   Disposable patterns for resource cleanup
 * - /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/electron-browser/preload.js
 *   Original Electron preload implementation
 *
 * TODOs for Missing Functionality:
 * --------------------------------
 * - TODO: Implement MessagePort support for structured clone data transfer
 * - TODO: Add performance metrics tracking for preload initialization time
 * - TODO: Implement secure context isolation validation
 * - TODO: Add support for webFrame.setVisualZoomLevelLimits (Zoom UX)
 * - TODO: Implement crash reporting integration with Mountain
 * - TODO: Add telemetry instrumentation for preload events
 * - TODO: Support multiple window instances (workbench windows)
 * - TODO: Implement process.getProcessMemoryInfo() with real memory stats
 * - TODO: Add proper sandbox security context validation
 * - TODO: Implement webFrame.executeJavaScript() for workbench IPC
 * - TODO: Add support for contextBridge patterns if needed
 * - TODO: Implement proper error recovery for configuration loading
 * - TODO: Add logging integration with Mountain's centralized logging
 * - TODO: Support electron API version compatibility matrix
 * - TODO: Implement proper cleanup on webview termination
 *
 * Connections to Other Elements:
 * ------------------------------
 * - Mountain: Backend gRPC service providing configuration and IPC handling
 * - Sky: UI integration via window.vscode API for workbench
 * - Cocoon: Extension Host communication through IPC bridge
 * - Air: Build system integration for development workflow
 *
 * @see Bootstrap.ts for main bootstrap orchestration after preload completes
 */

import type { IpcRenderer, IpcRendererEvent } from '@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes.js';
import type { IMainWindowSandboxGlobals, ISandboxNodeProcess } from '@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals.js';
import type { ISandboxConfiguration } from '@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js';
import { invoke as TauriInvoke } from '@tauri-apps/api/core';
import { emit as TauriEmit, listen as TauriListen } from '@tauri-apps/api/event';

// ============================================================================
// GLOBAL STATE
// ============================================================================

/** Cached resolved configuration to avoid redundant fetches */
let ResolvedConfiguration: ISandboxConfiguration | null = null;

/** Promise for ongoing configuration fetch operation */
let ConfigurationPromise: Promise<ISandboxConfiguration> | null = null;

/** Map tracking IPC event listeners for cleanup */
const ListenerMap = new Map<string, Map<Function, any>>();

/** Preload initialization state tracking */
let IsPreloadInitialized = false;

/** Initialization error state for graceful degradation */
let InitializationError: Error | null = null;

// ============================================================================
// CONFIGURATION RESOLUTION
// ============================================================================

/**
 * Fetches workbench configuration from Mountain backend
 * Implements caching and graceful degradation
 *
 * @returns Resolved sandbox configuration
 */
async function ResolveConfiguration(): Promise<ISandboxConfiguration> {
	// Return cached configuration if available
	if (ResolvedConfiguration) {
		return ResolvedConfiguration;
	}
	
	// Return ongoing fetch if in progress
	if (ConfigurationPromise) {
		return ConfigurationPromise;
	}
	
	// Start new configuration fetch
	ConfigurationPromise = (async (): Promise<ISandboxConfiguration> => {
		try {
			console.log('[Wind Preload] Fetching configuration from Mountain...');
			
			// Fetch configuration from backend
			const config = await TauriInvoke<any>('mountain_get_workbench_configuration');
			
			// Validate configuration structure
			if (!config || typeof config !== 'object') {
				throw new Error('Invalid configuration received from Mountain backend');
			}
			
			// Validate required fields
			if (!('windowId' in config) || !('appRoot' in config)) {
				throw new Error('Configuration missing required fields: windowId, appRoot');
			}
			
			ResolvedConfiguration = config;
			console.log('[Wind Preload] Configuration resolved successfully');
			return config;
			
		} catch (error) {
			console.error('[Wind Preload] Failed to resolve configuration:', error);
			InitializationError = error instanceof Error ? error : new Error(String(error));
			
			// Return minimal fallback configuration for degraded operation
			ResolvedConfiguration = CreateFallbackConfiguration();
			return ResolvedConfiguration;
		}
	})();
	
	return ConfigurationPromise;
}

/**
 * Creates minimal fallback configuration for degraded operation
 * Used when Mountain backend is unavailable or returns invalid config
 *
 * @returns Minimal but functional sandbox configuration
 */
function CreateFallbackConfiguration(): ISandboxConfiguration {
	return {
		windowId: 1,
		machineId: 'fallback-machine-id',
		sessionId: 'fallback-session-id',
		appRoot: 'file:///app',
		userDataPath: 'file:///app/user-data',
		logLevel: 2, // LogLevel.Info
		userEnv: {},
		platform: 'web',
		arch: 'web',
		zoomLevel: 0,
		nls: {
			language: 'en',
			availableLanguages: { en: 'English' },
			messages: {}
		},
		productConfiguration: {
			nameShort: 'VSCode',
			nameLong: 'VSCode Wind',
			applicationName: 'vscode-wind'
		}
	};
}

// ============================================================================
// IPC RENDERER SHIM
// ============================================================================

/**
 * Validates IPC channel names for security and compatibility
 * Follows VSCode IPC channel naming conventions
 *
 * @param channel - IPC channel name to validate
 * @param allowNonPrefix - Allow channels without 'vscode:' prefix (for internal use)
 * @returns True if channel is valid, false otherwise
 */
function ValidateIPCChannel(channel: string, allowNonPrefix = false): boolean {
	// Type guard: ensure channel is a non-empty string
	if (!channel || typeof channel !== 'string') {
		console.warn(`[Wind Preload] Invalid IPC channel type: ${typeof channel}`);
		return false;
	}
	
	// Check for empty channel after trimming
	if (channel.trim().length === 0) {
		console.warn('[Wind Preload] Empty IPC channel name');
		return false;
	}
	
	// Enforce VSCode channel prefix (unless explicitly allowed)
	if (!allowNonPrefix && !channel.startsWith('vscode:')) {
		console.warn(`[Wind Preload] IPC channel must start with 'vscode:': ${channel}`);
		return false;
	}
	
	// Check for suspicious characters (prevent injection attempts)
	const suspiciousChars = /[<>"'\\]/;
	if (suspiciousChars.test(channel)) {
		console.warn(`[Wind Preload] Suspicious characters in IPC channel: ${channel}`);
		return false;
	}
	
	return true;
}

/**
 * Creates IPC renderer shim compatible with VSCode's IElectronEnvironment
 * Translates Electron IPC calls to Tauri's event system
 *
 * @returns IpcRenderer implementation using Tauri APIs
 *
 * @see /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/electron-browser/electronTypes.ts
 */
function CreateIpcRenderer(): IpcRenderer {
	const IpcRendererInstance: IpcRenderer = {
		/**
		 * Sends an asynchronous message to Mountain backend
		 * Note: Does not wait for response
		 */
		send(channel: string, ...args: any[]): void {
			if (!ValidateIPCChannel(channel)) {
				console.warn(`[Wind Preload] ipcRenderer.send blocked: invalid channel`);
				return;
			}
			
			console.log(`[Wind Preload] ipcRenderer.send: ${channel}`);
			
			TauriInvoke('mountain_ipc_send', { channel, args })
				.catch((error) => {
					console.error(`[Wind Preload] Error in ipcRenderer.send (${channel}):`, error);
				});
		},
		
		/**
		 * Sends an asynchronous message and waits for response
		 * Returns Promise that resolves with backend response
		 */
		async invoke(channel: string, ...args: any[]): Promise<any> {
			if (!ValidateIPCChannel(channel)) {
				throw new Error(`Invalid IPC channel: ${channel}`);
			}
			
			if (typeof args[0] !== 'undefined') {
				console.log(`[Wind Preload] ipcRenderer.invoke: ${channel}`);
				console.log(`[Wind Preload] invoke payload:`, args[0]);
			} else { console.log(`[Wind Preload] ipcRenderer.invoke: ${channel}`); }
			
			try {
				return await TauriInvoke(`vscode_ipc:${channel.substring(7)}`, { args });
			} catch (error) {
				console.error(`[Wind Preload] Error in ipcRenderer.invoke (${channel}):`, error);
				throw error;
			}
		},
		
		/**
		 * Registers a persistent listener for IPC channel events
		 * Listener remains active until explicitly removed
		 */
		on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			if (!ValidateIPCChannel(channel, channel === 'message')) {
				console.warn(`[Wind Preload] ipcRenderer.on blocked: invalid channel`);
				return this;
			}
			
			// Get or create channel listener map
			const channelListeners = ListenerMap.get(channel) || new Map();
			ListenerMap.set(channel, channelListeners);
			
			// Prevent duplicate listener registration
			if (channelListeners.has(listener)) {
				console.warn(`[Wind Preload] Listener already registered for: ${channel}`);
				return this;
			}
			
			// Create Tauri event listener with VSCode-compatible event shim
			const unlistenPromise = TauriListen(channel, (event) => {
				const eventShim: IpcRendererEvent = {
					sender: IpcRendererInstance,
					// TODO: Add preventDefault and defaultPrevented when needed
					preventDefault: () => {},
					defaultPrevented: false
				};
				
				try {
					listener(eventShim, ...(event.payload || []));
				} catch (error) {
					console.error(`[Wind Preload] Error in listener for ${channel}:`, error);
					// Prevent listener errors from crashing the preload
				}
			});
			
			channelListeners.set(listener, unlistenPromise);
			return this;
		},
		
		/**
		 * Registers a one-time listener that automatically removes after first invocation
		 */
		once(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			if (!ValidateIPCChannel(channel)) {
				console.warn(`[Wind Preload] ipcRenderer.once blocked: invalid channel`);
				return this;
			}
			
			let unlistenFn: any = null;
			const wrapper = (event: any) => {
				// Cleanup listener on first invocation
				if (unlistenFn) {
					unlistenFn();
					ListenerMap.get(channel)?.delete(listener);
				}
				
				const eventShim: IpcRendererEvent = { 
						sender: IpcRendererInstance,
					preventDefault: () => {},
					defaultPrevented: false
				};
				
				try {
					listener(eventShim, ...(event.payload || []));
				} catch (error) {
					console.error(`[Wind Preload] Error in one-time listener for ${channel}:`, error);
				}
			};
			
			const unlistenPromise = TauriListen(channel, wrapper);
			const channelListeners = ListenerMap.get(channel) || new Map();
			ListenerMap.set(channel, channelListeners);
			channelListeners.set(listener, unlistenPromise);
			
			unlistenPromise.then((fn) => {
				unlistenFn = fn;
			});
			
			return this;
		},
		
		/**
		 * Removes a previously registered listener
		 */
		removeListener(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			const channelListeners = ListenerMap.get(channel);
			if (channelListeners) {
				const unlisten = channelListeners.get(listener);
				if (unlisten) {
					try {
						if (typeof unlisten === 'function') {
							unlisten();
						} else {
							unlisten.then((fn: any) => {
								if (fn) fn();
							}).catch((Error) => {
								console.error(`[Wind Preload] Error removing listener for ${channel}:`, Error);
							});
						}
					channelListeners.delete(listener);
				} catch (error) {
					console.error(`[Wind Preload] Exception during removeListener for ${channel}:`, error);
				}
			}
		}
			return this;
		},
		
		/**
		 * Emits an event locally to all listeners on the channel
		 */
		emit(channel: string, ...args: any[]): boolean {
			console.log(`[Wind Preload] ipcRenderer.emit: ${channel}`);
			TauriEmit(channel, ...args).catch((error) => {
				console.error(`[Wind Preload] Error in emit (${channel}):`, error);
			});
			return true;
		}
	};
	
	return IpcRendererInstance;
}

// ============================================================================
// PROCESS SHIM
// ============================================================================

/**
 * Creates Node.js process shim compatible with VSCode's expectations
 * Provides limited but essential process information for the sandboxed environment
 *
 * @param config - Resolved sandbox configuration
 * @returns ISandboxNodeProcess implementation
 *
 * @see /Dependency/Microsoft/Dependency/Editor/src/vs/base/parts/sandbox/electron-browser/globals.js
 */
function CreateProcess(config: ISandboxConfiguration): ISandboxNodeProcess {
	// Defensive: ensure required config fields exist
	const arch = config.arch || 'web';
	const platform = config.platform || 'web';
	const userEnv = config.userEnv || {};
	
	const ProcessShim: ISandboxNodeProcess = {
		// Spread user environment variables
		...userEnv,
		
		// Process identification
		pid: -1, // Webview has no real PID
		
		// Platform information
		arch: arch as string,
		platform: platform as NodeJS.Platform,
		type: 'renderer',
		
		// Current working directory (virtual, since webview is sandboxed)
		cwd: () => '/app',
		
		// Environment variables (copy to prevent mutation)
		env: { ...userEnv },
		
		// Version information (mocked for compatibility)
		versions: {
			node: '18.0.0',
			chrome: '120.0.0',
			electron: '28.0.0'
		},
		
		/**
		 * Get process memory information
		 * TODO: Implement real memory stats from Tauri backend
		 */
		getProcessMemoryInfo: async () => {
			try {
				// In a real implementation, fetch from backend
				return {
					residentSet: 100 * 1024 * 1024, // 100 MB
					privateBytes: 50 * 1024 * 1024,  // 50 MB
					sharedBytes: 20 * 1024 * 1024    // 20 MB
				};
			} catch (error) {
				console.warn('[Wind Preload] Failed to get memory info:', error);
				// Return zero values on error
				return { residentSet: 0, privateBytes: 0, sharedBytes: 0 };
			}
		},
		
		// Sandbox flag
		sandboxed: true,
		
		// Executable paths
		execPath: '/app/vscode-wind',
		resourcesPath: '/app/resources',
		
		/**
		 * Fetch shell environment variables
		 * Falls back to minimal PATH if unavailable
		 */
		shellEnv: async () => {
			try {
				const env = await TauriInvoke('mountain_fetch_shell_env');
				if (env && typeof env === 'object') {
					return env;
				}
				throw new Error('Invalid shell environment response');
			} catch (error) {
				console.warn('[Wind Preload] Failed to fetch shell env, using fallback:', error);
				// Fallback to minimal PATH
				return { 
					PATH: '/usr/bin:/bin',
					HOME: '/home/user'
				};
			}
		},
		
		/**
		 * Process event listeners
		 * Currently only supports basic warning for uncaughtException
		 * TODO: Implement proper error boundary system
		 */
		on: (type: string, callback: (...args: any[]) => void): void => {
			if (!type || typeof type !== 'string') {
				console.warn('[Wind Preload] Invalid event type for process.on');
				return;
			}
			
			if (type === 'uncaughtException') {
				console.warn('[Wind Preload] process.on(uncaughtException) registered');
				// TODO: Integrate with global error boundary
			}
			
			// Note: Other process events not implemented in sandboxed environment
		}
	};
	
	return ProcessShim;
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

/**
 * Main initialization entry point for Wind preload
 * Runs immediately when webview loads, before any page content
 */
(async function InitializePreload(): Promise<void> {
	try {
		console.log('[Wind Preload] ============================================');
		console.log('[Wind Preload] Initializing Wind environment...');
		console.log('[Wind Preload] ============================================');
		
		// Resolve configuration from backend
		const config = await ResolveConfiguration();
		
		// Create global VSCode object with all required shims
		const globals: IMainWindowSandboxGlobals = {
			// IPC renderer shim for VSCode communication
			ipcRenderer: CreateIpcRenderer(),
			
			// Process information shim
			process: CreateProcess(config),
			
			// Context with configuration accessors
			context: {
				configuration: () => {
					return config;
				},
				resolveConfiguration: async () => {
					return config;
				}
			},
			
			// WebFrame shim (limited implementation)
			webFrame: {
				setZoomLevel: (level: number) => {
					if (typeof level !== 'number' || isNaN(level)) {
						console.warn(`[Wind Preload] Invalid zoom level: ${level}`);
						return;
					}
					console.log(`[Wind Preload] setZoomLevel: ${level}`);
					// TODO: Implement actual zoom level via DPI scaling
					// TODO: Persist zoom level to Mountain backend
				}
			},
			
			// Web utilities
			webUtils: {
				getPathForFile: (file: File) => {
					if (!file) {
						return '';
					}
					return file.name;
				}
			},
			
			// IPC Message Port (placeholder for future implementation)
			ipcMessagePort: {
				acquire: () => {
					console.log('[Wind Preload] ipcMessagePort.acquire called');
					// TODO: Implement real MessagePort support
					// TODO: Return connected MessagePort for structured clone
					return { port1: null, port2: null };
				}
			}
		};
		
		// Attach to window as 'vscode' global (VSCode convention)
		(window as any).vscode = globals;
		
		// Mark initialization as complete
		IsPreloadInitialized = true;
		
		console.log('[Wind Preload] ✓ window.vscode initialized successfully');
		console.log('[Wind Preload] ✓ Environment ready for VSCode workbench');
		console.log('[Wind Preload] ============================================');
		
		// Dispatch event to notify that preload is ready
		// VSCode workbench waits for this before starting
		window.dispatchEvent(new Event('vscode-wind-preload-ready'));
		
	} catch (error) {
		// Capture initialization error for graceful degradation
		InitializationError = error instanceof Error ? error : new Error(String(error));
		
		console.error('[Wind Preload] ============================================');
		console.error('[Wind Preload] ✗ Fatal error during initialization:');
		console.error('[Wind Preload]', InitializationError.message);
		if (InitializationError.stack) {
			console.error('[Wind Preload]', InitializationError.stack);
		}
		console.error('[Wind Preload] ============================================');
		
		// Show error in UI for debugging (only when DOM is ready)
		ShowInitializationError(InitializationError);
	}
})();

/**
 * Displays initialization error in the webview UI
 * Helps developers diagnose preload failures
 *
 * @param error - The error to display
 */
function ShowInitializationError(error: Error): void {
	try {
		const errorDiv = document.createElement('div');
		errorDiv.innerHTML = `
			<div style="color: #d32f2f; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; background: #ffebee; border: 1px solid #ffcdd2; border-radius: 4px; margin: 20px;">
				<h2 style="margin: 0 0 10px 0; font-size: 18px;">Wind Preload Initialization Error</h2>
				<p style="margin: 10px 0; white-space: pre-wrap;">${error.message}</p>
				<p style="margin: 10px 0; font-size: 12px; opacity: 0.8;">The workbench may not function correctly. Check the browser console for details.</p>
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
		
		// Report error to backend if available
		ReportInitializationError(error)
			.catch((err) => {
				console.warn('[Wind Preload] Failed to report initialization error:', err);
			});
		
	} catch (uiError) {
		// If error display fails, at least log to console
		console.error('[Wind Preload] Failed to display initialization error:', uiError);
	}
}

/**
 * Reports initialization error to Mountain backend for monitoring
 *
 * @param error - The error to report
 */
async function ReportInitializationError(error: Error): Promise<void> {
	try {
		await TauriInvoke('mountain_report_preload_error', {
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString()
		});
	} catch (reportError) {
		// Silently fail if reporting is unavailable
		console.warn('[Wind Preload] Could not report error to backend:', reportError);
	}
}
