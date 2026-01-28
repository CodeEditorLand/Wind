/**
 * @module Preload
 * @description
 * Main preload script for Wind - creates VSCode-compatible environment in Tauri webview.
 * This script runs before all other page content and sets up the window.vscode API shim.
 * 
 * Architecture:
 * 1. Set up Electron API shims (ipcRenderer, process, etc.)
 * 2. Initialize window.vscode global object
 * 3. Load bootstrap configuration from Mountain backend
 * 4. Prepare workbench initialization
 */

import type { IpcRenderer, IpcRendererEvent } from '@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes.js';
import type { IMainWindowSandboxGlobals, ISandboxNodeProcess } from '@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals.js';
import type { ISandboxConfiguration } from '@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js';
import { invoke as TauriInvoke } from '@tauri-apps/api/core';
import { emit as TauriEmit, listen as TauriListen } from '@tauri-apps/api/event';

// ============================================================================
// GLOBAL STATE
// ============================================================================

let resolvedConfiguration: ISandboxConfiguration | null = null;
let configurationPromise: Promise<ISandboxConfiguration> | null = null;
const listenerMap = new Map<string, Map<Function, any>>();

// ============================================================================
// CONFIGURATION RESOLUTION
// ============================================================================

/**
 * Fetches workbench configuration from Mountain backend
 */
async function resolveConfiguration(): Promise<ISandboxConfiguration> {
	if (resolvedConfiguration) {
		return resolvedConfiguration;
	}
	
	if (configurationPromise) {
		return configurationPromise;
	}
	
	configurationPromise = (async () => {
		try {
			console.log('[Wind Preload] Fetching configuration from Mountain...');
			
			const config = await TauriInvoke<any>('mountain_get_workbench_configuration');
			
			if (!config || typeof config !== 'object') {
				throw new Error('Invalid configuration received');
			}
			
			resolvedConfiguration = config;
			console.log('[Wind Preload] Configuration resolved successfully');
			return config;
			
		} catch (error) {
			console.error('[Wind Preload] Failed to resolve configuration:', error);
			// Return minimal fallback configuration
			resolvedConfiguration = createFallbackConfiguration();
			return resolvedConfiguration;
		}
	})();
	
	return configurationPromise;
}

/**
 * Creates minimal fallback configuration for degraded operation
 */
function createFallbackConfiguration(): ISandboxConfiguration {
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
 * Validates IPC channel names
 */
function validateIPCChannel(channel: string, allowNonPrefix = false): boolean {
	if (!channel || typeof channel !== 'string') {
		console.warn(`[Wind Preload] Invalid IPC channel: ${channel}`);
		return false;
	}
	
	if (!allowNonPrefix && !channel.startsWith('vscode:')) {
		console.warn(`[Wind Preload] IPC channel must start with 'vscode:': ${channel}`);
		return false;
	}
	
	return true;
}

/**
 * Creates IPC renderer shim
 */
function createIpcRenderer(): IpcRenderer {
	const instance: IpcRenderer = {
		send(channel: string, ...args: any[]): void {
			if (!validateIPCChannel(channel)) return;
			
			console.log(`[Wind Preload] ipcRenderer.send: ${channel}`);
			
			TauriInvoke('mountain_ipc_send', { channel, args })
				.catch((error) => {
					console.error(`[Wind Preload] Error in ipcRenderer.send:`, error);
				});
		},
		
		async invoke(channel: string, ...args: any[]): Promise<any> {
			if (!validateIPCChannel(channel)) {
				throw new Error(`Invalid IPC channel: ${channel}`);
			}
			
			console.log(`[Wind Preload] ipcRenderer.invoke: ${channel}`);
			
			try {
				return await TauriInvoke(`vscode_ipc:${channel.substring(7)}`, { args });
			} catch (error) {
				console.error(`[Wind Preload] Error in ipcRenderer.invoke:`, error);
				throw error;
			}
		},
		
		on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			if (!validateIPCChannel(channel, channel === 'message')) return this;
			
			const channelListeners = listenerMap.get(channel) || new Map();
			listenerMap.set(channel, channelListeners);
			
			if (channelListeners.has(listener)) {
				console.warn(`[Wind Preload] Listener already registered for: ${channel}`);
				return this;
			}
			
			const unlistenPromise = TauriListen(channel, (event) => {
				const eventShim: IpcRendererEvent = {
					sender: instance
				};
				
				try {
					listener(eventShim, ...(event.payload || []));
				} catch (error) {
					console.error(`[Wind Preload] Error in listener for ${channel}:`, error);
				}
			});
			
			channelListeners.set(listener, unlistenPromise);
			return this;
		},
		
		once(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			if (!validateIPCChannel(channel)) return this;
			
			let unlistenFn: any = null;
			const wrapper = (event: any) => {
				if (unlistenFn) {
					unlistenFn();
					listenerMap.get(channel)?.delete(listener);
				}
				
				const eventShim: IpcRendererEvent = { sender: instance };
				
				try {
					listener(eventShim, ...(event.payload || []));
				} catch (error) {
					console.error(`[Wind Preload] Error in one-time listener:`, error);
				}
			};
			
			const unlistenPromise = TauriListen(channel, wrapper);
			const channelListeners = listenerMap.get(channel) || new Map();
			listenerMap.set(channel, channelListeners);
			channelListeners.set(listener, unlistenPromise);
			
			unlistenPromise.then((fn) => {
				unlistenFn = fn;
			});
			
			return this;
		},
		
		removeListener(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): IpcRenderer {
			const channelListeners = listenerMap.get(channel);
			if (channelListeners) {
				const unlisten = channelListeners.get(listener);
				if (unlisten) {
					if (typeof unlisten === 'function') {
						unlisten();
					} else {
						unlisten.then((fn: any) => fn());
					}
					channelListeners.delete(listener);
				}
			}
			return this;
		},
		
		emit(channel: string, ...args: any[]): boolean {
			console.log(`[Wind Preload] ipcRenderer.emit: ${channel}`);
			TauriEmit(channel, ...args).catch((error) => {
				console.error(`[Wind Preload] Error in emit:`, error);
			});
			return true;
		}
	};
	
	return instance;
}

// ============================================================================
// PROCESS SHIM
// ============================================================================

function createProcess(config: ISandboxConfiguration): ISandboxNodeProcess {
	const processShim: ISandboxNodeProcess = {
		...config.userEnv,
		pid: -1,
		arch: config.arch as string,
		platform: config.platform as NodeJS.Platform,
		type: 'renderer',
		cwd: () => '/app',
		env: { ...config.userEnv },
		versions: {
			node: '18.0.0',
			chrome: '120.0.0',
			electron: '28.0.0'
		},
		getProcessMemoryInfo: async () => {
			return {
				residentSet: 100 * 1024 * 1024,
				privateBytes: 50 * 1024 * 1024,
				sharedBytes: 20 * 1024 * 1024
			};
		},
		sandboxed: true,
		execPath: '/app/vscode-wind',
		resourcesPath: '/app/resources',
		shellEnv: async () => {
			try {
				return await TauriInvoke('mountain_fetch_shell_env');
			} catch (error) {
				console.warn('[Wind Preload] Failed to fetch shell env:', error);
				return { PATH: '/usr/bin:/bin' };
			}
		},
		on: (type: string, callback: (...args: any[]) => void): void => {
			if (type === 'uncaughtException') {
				console.warn('[Wind Preload] process.on(uncaughtException) registered');
			}
		}
	};
	
	return processShim;
}

// ============================================================================
// MAIN INITIALIZATION
// ============================================================================

(async () => {
	try {
		console.log('[Wind Preload] Initializing Wind environment...');
		
		// Resolve configuration
		const config = await resolveConfiguration();
		
		// Create global VSCode object
		const globals: IMainWindowSandboxGlobals = {
			ipcRenderer: createIpcRenderer(),
			process: createProcess(config),
			context: {
				configuration: () => config,
				resolveConfiguration: async () => config
			},
			webFrame: {
				setZoomLevel: (level: number) => {
					console.log(`[Wind Preload] setZoomLevel: ${level}`);
				}
			},
			webUtils: {
				getPathForFile: (file: File) => file.name
			},
			ipcMessagePort: {
				acquire: () => {
					console.log('[Wind Preload] ipcMessagePort.acquire called');
					return { port1: null, port2: null };
				}
			}
		};
		
		// Attach to window
		(window as any).vscode = globals;
		
		console.log('[Wind Preload] ✓ window.vscode initialized successfully');
		console.log('[Wind Preload] ✓ Environment ready for VSCode workbench');
		
		// Dispatch event to notify that preload is ready
		window.dispatchEvent(new Event('vscode-wind-preload-ready'));
		
	} catch (error) {
		console.error('[Wind Preload] ✗ Fatal error during initialization:', error);
		
		// Show error in UI
		const errorDiv = document.createElement('div');
		errorDiv.textContent = `Wind Preload Error: ${error instanceof Error ? error.message : String(error)}`;
		errorDiv.setAttribute('style', 'color: red; padding: 20px; font-family: sans-serif; font-size: 14px;');
		document.addEventListener('DOMContentLoaded', () => {
			document.body.prepend(errorDiv);
		});
	}
})();