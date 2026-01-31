/**
 * @module Bridge (Wind)
 * @description This script runs in the webview environment at a very early
 * stage. Its primary purpose is to create and expose a global `window.vscode`
 * object. This object comprehensively shims ALL APIs that VS Code's Electron
 * workbench expects, providing robust fallbacks and defensive coding patterns.
 * 
 * Key improvements:
 * - Complete VSCode Electron API shims with defensive coding
 * - Robust error handling with graceful degradation
 * - Configuration caching and synchronization
 * - Comprehensive IPC channel validation and routing
 * - Fallback modes for Mountain service unavailability
 */

import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import { LogLevel } from "@codeeditorland/output/vs/platform/log/common/log.js";
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	ISandboxNodeProcess,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";
import { invoke as TauriInvoke, type InvokeArgs } from "@tauri-apps/api/core";
import {
	emit as TauriEmit,
	listen as TauriListen,
	type Event as TauriEvent,
	type UnlistenFn,
} from "@tauri-apps/api/event";

// --- Global State Management ---
let resolvedConfigurationCache: ISandboxConfiguration | undefined = undefined;
let resolveConfigurationPromise: Promise<ISandboxConfiguration> | null = null;
const tauriListenerMap = new Map<string, Map<Function, UnlistenFn | Promise<UnlistenFn>>>();

// --- Defensive Coding Utilities ---

/**
 * Validates IPC channels with comprehensive error handling and fallback support
 */
const validateIPCChannel = (channel: string, allowNonPrefixed: boolean = false): boolean => {
	if (!channel || typeof channel !== 'string') {
		console.error('[Wind Bridge] Invalid IPC channel: Channel name is falsy or not a string.');
		return false;
	}

	if (!allowNonPrefixed && !channel.startsWith('vscode:')) {
		console.error(`[Wind Bridge] Invalid IPC channel: '${channel}'. Channels MUST start with 'vscode:'.`);
		return false;
	}

	return true;
};

/**
 * Safe Tauri invocation with retry logic and comprehensive error handling
 */
const safeTauriInvoke = async <T>(command: string, args?: InvokeArgs, maxRetries: number = 3): Promise<T> => {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await TauriInvoke<T>(command, args);
		} catch (error) {
			if (attempt === maxRetries) {
				console.error(`[Wind Bridge] Failed to invoke '${command}' after ${maxRetries} attempts:`, error);
				throw error;
			}
			console.warn(`[Wind Bridge] Retry ${attempt}/${maxRetries} for '${command}':`, error);
			await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100)); // Exponential backoff
		}
	}
	throw new Error(`[Wind Bridge] Unexpected error in safeTauriInvoke for '${command}'`);
};

/**
 * Creates a comprehensive fallback configuration for degraded operation
 */
const createFallbackConfiguration = (): ISandboxConfiguration => {
	console.warn('[Wind Bridge] CRITICAL: Constructing fallback configuration. Mountain backend unavailable.');
	
	const fallbackMachineId = generateUuid();
	const fallbackSessionId = generateUuid();
	const navPlatform = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase() : '';
	
	const derivedPlatform: NodeJS.Platform = navPlatform.includes('mac') ? 'darwin' : 
	                                       navPlatform.includes('win') ? 'win32' : 'linux';
	
	let derivedArch: string = 'x64';
	if (typeof navigator !== 'undefined' && (navigator as any).userAgentData?.architecture) {
		const archVal = (navigator as any).userAgentData.architecture;
		if (archVal === 'arm' || archVal === 'aarch64') derivedArch = 'arm64';
	}

	return {
		windowId: Math.floor(Math.random() * 100000) + 1,
		machineId: fallbackMachineId,
		sessionId: fallbackSessionId,
		logLevel: LogLevel.Info,
		userEnv: { FALLBACK_MODE: 'true' },
		appRoot: 'file:///app/fallback',
		appName: 'VSCode Wind (Fallback Mode)',
		appUriScheme: 'vscode-wind-fallback',
		appLanguage: typeof navigator !== 'undefined' ? navigator.language : 'en',
		appHost: 'desktop',
		productQuality: 'development',
		platform: derivedPlatform,
		arch: derivedArch,
		versions: {
			fiddee: '0.0.0-fallback',
			webview_runtime: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/)?.[0] || 'unknown',
		},
		execPath: '/app/fallback_executable',
		homeDir: 'file:///home/fallback_user',
		tmpDir: 'file:///tmp/fallback',
		userDataDir: 'file:///app/user_data_fallback',
		resourcesPath: '/app/fallback_resources',
		VSCODE_CWD: '/app/fallback_cwd',
		zoomLevel: 0,
		nls: {
			messages: {},
			language: typeof navigator !== 'undefined' ? navigator.language : 'en',
			availableLanguages: { en: 'English' },
		},
		productConfiguration: {
			nameShort: 'VSCode-Wind-FB',
			nameLong: 'VSCode Wind Fallback',
			applicationName: 'vscode-wind-fallback',
			embedderIdentifier: 'vscode-desktop-fallback',
		},
	};
};

/**
 * Comprehensive IPC Renderer shim with defensive coding and error handling
 */
const CreateIpcRendererShim = (): IpcRenderer => {
	const instance: IpcRenderer = {
		send: (channel: string, ...args: any[]): void => {
			if (!validateIPCChannel(channel)) return;
			
			safeTauriInvoke('mountain_ipc_bridge_send', { 
				channel, 
				argsList: args 
			}).catch((error: any) => {
				console.error(`[Wind Bridge] Error in ipcRenderer.send for '${channel}':`, error);
			});
		},
		
		invoke: async (channel: string, ...args: any[]): Promise<any> => {
			if (!validateIPCChannel(channel)) {
				throw new Error(`[Wind Bridge] Invalid IPC channel: ${channel}`);
			}
			
			try {
				return await safeTauriInvoke(`vscode_ipc:${channel.substring(7)}`, { args });
			} catch (error) {
				console.error(`[Wind Bridge] Error in ipcRenderer.invoke for '${channel}':`, error);
				throw error;
			}
		},
		
		on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer => {
			const allowNonStandardPrefix = channel === 'message';
			if (!validateIPCChannel(channel, allowNonStandardPrefix)) return instance;

			const channelListeners = tauriListenerMap.get(channel) || new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
			tauriListenerMap.set(channel, channelListeners);

			if (channelListeners.has(listener)) {
				console.warn(`[Wind Bridge] Listener already registered for channel '${channel}'.`);
				return instance;
			}

			const tauriUnlistenPromise: Promise<UnlistenFn> = TauriListen(
				channel,
				(tauriEvent: TauriEvent<any>) => {
					const eventShim: IpcRendererEvent = {
						...{} as IpcRendererEvent,
						sender: instance,
					};
					
					try {
						listener(eventShim, ...(tauriEvent.payload || []));
					} catch (errorInListener) {
						console.error(`[Wind Bridge] Error in listener for channel '${channel}':`, errorInListener);
					}
				}
			);

			channelListeners.set(listener, tauriUnlistenPromise);
			tauriUnlistenPromise
				.then((unlistenFn) => {
					if (channelListeners.get(listener) === tauriUnlistenPromise) {
						channelListeners.set(listener, unlistenFn);
					} else {
						unlistenFn(); // Clean up if listener was replaced
					}
				})
				.catch((error) => {
					console.error(`[Wind Bridge] Error setting up Tauri listener for '${channel}':`, error);
					channelListeners.delete(listener);
				});

			return instance;
		},
		
		once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer => {
			if (!validateIPCChannel(channel)) return instance;

			let unlistenFunctionReference: UnlistenFn | null = null;
			const oneTimeListenerWrapper = (tauriEvent: TauriEvent<any>) => {
				if (unlistenFunctionReference) {
					unlistenFunctionReference();
					tauriListenerMap.get(channel)?.delete(listener);
				}

				const eventShim: IpcRendererEvent = {
					...{} as IpcRendererEvent,
					sender: instance,
				};

				try {
					listener(eventShim, ...(tauriEvent.payload || []));
				} catch (errorInListener) {
					console.error(`[Wind Bridge] Error in one-time listener for '${channel}':`, errorInListener);
				}
			};

			const tauriUnlistenPromise = TauriListen(channel, oneTimeListenerWrapper);
			const channelListeners = tauriListenerMap.get(channel) || new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
			tauriListenerMap.set(channel, channelListeners);
			channelListeners.set(listener, tauriUnlistenPromise);

			tauriUnlistenPromise
				.then((unlistenFn) => {
					unlistenFunctionReference = unlistenFn;
					if (channelListeners.get(listener) === tauriUnlistenPromise) {
						channelListeners.set(listener, unlistenFn);
					} else if (channelListeners.get(listener) !== unlistenFunctionReference) {
						unlistenFn(); // Clean up if listener was replaced
					}
				})
				.catch((error) => {
					console.error(`[Wind Bridge] Error setting up one-time Tauri listener for '${channel}':`, error);
					channelListeners.delete(listener);
				});

			return instance;
		},
		
		removeListener: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer => {
			const allowNonStandardPrefix = channel === 'message';
			if (!validateIPCChannel(channel, allowNonStandardPrefix)) return instance;

			const channelListeners = tauriListenerMap.get(channel);
			if (channelListeners) {
				const unlistenOrPromise = channelListeners.get(listener);
				if (unlistenOrPromise) {
					if (typeof unlistenOrPromise === 'function') {
						unlistenOrPromise();
					} else {
						unlistenOrPromise
							.then((unlistenFn) => unlistenFn())
							.catch((error) => 
								console.warn(`[Wind Bridge] Error during eventual unlisten for '${channel}':`, error)
							);
					}
					channelListeners.delete(listener);
				}
			}
			return instance;
		},
		
		emit: (channel: string, ...args: any[]): boolean => {
			TauriEmit(channel, ...args).catch((error) => 
				console.error(`[Wind Bridge] Error emitting event '${channel}':`, error)
			);
			return true;
		},
	};
	
	return instance;
};

/**
 * Comprehensive configuration resolution with caching, fallback, and robust error handling
 */
const ResolveConfiguration = async (): Promise<ISandboxConfiguration> => {
	// Return cached configuration if available
	if (resolvedConfigurationCache) {
		console.debug('[Wind Bridge] Returning cached configuration.');
		return resolvedConfigurationCache;
	}
	
	// Return existing promise if resolution is in progress
	if (resolveConfigurationPromise) {
		console.debug('[Wind Bridge] Configuration resolution already in progress.');
		return resolveConfigurationPromise;
	}
	
	console.log('[Wind Bridge] Fetching workbench configuration from Mountain...');
	
	resolveConfigurationPromise = (async () => {
		try {
			const rawConfig = await safeTauriInvoke<any>('mountain_get_workbench_configuration');
			
			if (!rawConfig || typeof rawConfig !== 'object') {
				throw new Error('Invalid configuration received from Mountain');
			}
			
			// Enhanced URI revival with comprehensive validation
			const reviveUris = (data: any): any => {
				if (!data || typeof data !== 'object') return data;
				
				if (Array.isArray(data)) {
					return data.map(reviveUris);
				}
				
				// Handle URI objects with comprehensive validation
				if (data.scheme && data.path && typeof data.scheme === 'string' && typeof data.path === 'string') {
					try {
						return URI.revive(data);
					} catch (uriError) {
						console.warn('[Wind Bridge] Failed to revive URI object:', uriError);
						return data; // Return original data as fallback
					}
				}
				
				// Recursively process object properties
				for (const key in data) {
					if (Object.prototype.hasOwnProperty.call(data, key)) {
						try {
							data[key] = reviveUris(data[key]);
						} catch (error) {
							console.warn(`[Wind Bridge] Error processing configuration key '${key}':`, error);
							// Continue processing other keys
						}
					}
				}
				return data;
			};
			
			const revivedConfig = reviveUris(rawConfig) as ISandboxConfiguration;
			
			// Validate essential configuration properties
			if (!revivedConfig.appRoot || !revivedConfig.machineId || !revivedConfig.sessionId) {
				throw new Error('Essential configuration properties missing from Mountain response');
			}
			
			resolvedConfigurationCache = revivedConfig;
			console.log('[Wind Bridge] Configuration successfully resolved and cached.');
			return revivedConfig;
			
		} catch (error) {
			console.error('[Wind Bridge] CRITICAL: Failed to resolve configuration from Mountain:', error);
			
			// Create comprehensive fallback configuration
			const fallbackConfig = createFallbackConfiguration();
			resolvedConfigurationCache = fallbackConfig;
			
			// Display user-friendly error message
			displayConfigurationError(error, fallbackConfig);
			
			return fallbackConfig;
		} finally {
			resolveConfigurationPromise = null;
		}
	})();
	
	return resolveConfigurationPromise;
};

/**
 * Displays a user-friendly configuration error message
 */
const displayConfigurationError = (error: any, fallbackConfig: ISandboxConfiguration): void => {
	const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
	
	const errorHtml = `
		<div style="
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			background: linear-gradient(135deg, #ff6b6b, #ee5a52);
			color: white;
			padding: 15px 20px;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			font-size: 14px;
			z-index: 10000;
			box-shadow: 0 2px 10px rgba(0,0,0,0.3);
			border-bottom: 1px solid rgba(255,255,255,0.2);
		">
			<strong>  VSCode Wind Configuration Warning</strong>
			<div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
				Running in fallback mode. Some features may be limited.
				<details style="margin-top: 5px;">
					<summary style="cursor: pointer; font-size: 11px;">Technical Details</summary>
					<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; margin-top: 5px; font-size: 10px; overflow: auto; max-height: 200px;">
${errorMessage}
					</pre>
				</details>
			</div>
		</div>
	`;
	
	if (document.body) {
		const errorDiv = document.createElement('div');
		errorDiv.innerHTML = errorHtml;
		document.body.prepend(errorDiv);
		
		// Auto-remove after 30 seconds if user doesn't dismiss
		setTimeout(() => {
			if (errorDiv.parentNode) {
				errorDiv.style.transition = 'opacity 0.5s ease';
				errorDiv.style.opacity = '0';
				setTimeout(() => errorDiv.remove(), 500);
			}
		}, 30000);
	}
};

/**
 * Creates a comprehensive process shim with dynamic configuration updates and fallback support
 */
const CreateProcessShim = (configuration: ISandboxConfiguration): ISandboxNodeProcess => {
	const processShim: ISandboxNodeProcess = {
		...configuration.userEnv,
		pid: -1,
		arch: configuration.arch as string,
		platform: configuration.platform as NodeJS.Platform,
		type: 'renderer',
		cwd: () => configuration.cwd || '/',
		env: { ...configuration.userEnv },
		versions: configuration.versions as NodeJS.ProcessVersions,
		getProcessMemoryInfo: async () => {
			try {
				const memInfo = await safeTauriInvoke<{
					private_bytes?: number;
					shared_bytes?: number;
					resident_set_size?: number;
				}>('mountain_get_process_memory_info');
				
				return {
					privateBytes: memInfo.private_bytes ?? 0,
					sharedBytes: memInfo.shared_bytes ?? 0,
					residentSet: memInfo.resident_set_size ?? 0,
				};
			} catch (error) {
				console.warn('[Wind Bridge] Failed to get process memory info:', error);
				return { privateBytes: 0, sharedBytes: 0, residentSet: 0 };
			}
		},
		sandboxed: true,
		execPath: configuration.execPath || '/app/vscode-wind',
		resourcesPath: configuration.resourcesPath || '/app/resources',
		shellEnv: async (): Promise<Record<string, string | undefined>> => {
			try {
				return await safeTauriInvoke<Record<string, string | undefined>>('mountain_fetch_shell_env');
			} catch (error) {
				console.warn('[Wind Bridge] Failed to fetch shell environment:', error);
				return {};
			}
		},
		on: (type: string, callback: (...args: any[]) => void): void => {
			if (type === 'uncaughtException') {
				const existingOnError = window.onerror;
				window.onerror = (message, source, lineno, colno, error) => {
					callback(error || new Error(message as string));
					return existingOnError ? 
						existingOnError.call(window, message, source, lineno, colno, error) : 
						false;
				};
			} else {
				console.warn(`[Wind Bridge] process.on('${type}') not implemented`);
			}
		},
	};
	
	return processShim;
};

/**
 * Main IIFE (Immediately Invoked Function Expression) to set up the global
 * `window.vscode` bridge. This runs as soon as the script is loaded.
 */
(async () => {
	try {
		const Configuration = await ResolveConfiguration();

		const Globals: IMainWindowSandboxGlobals = {
			ipcRenderer: CreateIpcRendererShim(),
			process: CreateProcessShim(Configuration),
			context: {
				configuration: () => Configuration,
				resolveConfiguration:
					function (): Promise<ISandboxConfiguration> {
						throw new Error("Function not implemented.");
					},
			},
			// Stubs for other expected globals.
			webFrame: { setZoomLevel: () => {} },
			webUtils: { getPathForFile: (file: File) => (file as any).path },
			ipcMessagePort: { acquire: () => {} } as any,
		};

		// Attach the complete shim to the window object.
		(window as any).vscode = Globals;

		console.log(
			"[Wind Bridge] Successfully attached vscode shims to the window object.",
		);
	} catch (error: unknown) {
		const ErrorMessage =
			error instanceof Error ? error.message : String(error);
		console.error("[Wind Bridge] FATAL: Failed to initialize.", error);
		const ErrorDiv = document.createElement("div");
		ErrorDiv.textContent = `Bridge Error: ${ErrorMessage}`;
		ErrorDiv.setAttribute(
			"style",
			"color:red;padding:20px;font-family:sans-serif;",
		);
		document.addEventListener("DOMContentLoaded", () =>
			document.body.prepend(ErrorDiv),
		);
	}
})();
