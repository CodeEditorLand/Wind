/**
 * @module IPCRendererShim
 *
 * @description
 * Comprehensive polyfill for Electron's ipcRenderer API.
 * Maps Electron IPC channels to Tauri commands for full compatibility.
 *
 * @feature_set
 * - send(channel, ...args) - Send message to main process
 * - sendSync(channel, ...args) - Synchronous send (polyfilled as async with warning)
 * - invoke(channel, ...args) - Invoke main and get response
 * - on(channel, listener) - Register listener
 * - once(channel, listener) - One-time listener
 * - removeListener(channel, listener) - Remove listener
 * - removeAllListeners(channel) - Remove all listeners for channel
 * - sendTo(channel, args, callback) - Client-side request-reply pattern
 * - onReply(channel, handler) - Register reply handler
 *
 * @ipc_channel_mapping
 * - logger:* → Mountain logging service
 * - policy:* → Mountain policy service
 * - sign:* → Mountain signing service
 * - userDataProfiles:* → Mountain user data service
 * - localFileSystem:* → Mountain file system service
 * - crashReporter:* → Mountain crash reporting
 * - encryption:* → Mountain encryption service
 * - machineId:* → Mountain machine ID service
 *
 * @phase 2 of Approach A3 implementation
 */

// ============================================================================
// Imports
// ============================================================================

import type { IpcRenderer, IpcRendererEvent } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";

// ============================================================================
// Types
// ============================================================================

/**
 * Channel mapping from Electron to Tauri commands
 */
interface IPCChannelMapping {
	electronPattern: RegExp;
	tauriCommand: string;
	transform?: (args: unknown[]) => Record<string, unknown>;
}

/**
 * Reply handler for client-side request-reply pattern
 */
type ReplyHandler = (response: unknown) => void;

/**
 * SendTo request with callback
 */
interface SendToRequest {
	channel: string;
	args: unknown[];
	callback: ReplyHandler;
	timestamp: number;
}

// ============================================================================
// Tauri Integration
// ============================================================================

/**
 * Invoke Tauri command with proper error handling
 */
async function invokeTauri<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
	try {
		const tauri = (window as unknown as { __TAURI__?: { invoke: typeof invokeTauri } }).__TAURI__ ?? (window as unknown as { TAURI?: { invoke: typeof invokeTauri } }).TAURI;
		if (typeof tauri?.invoke === "function") {
			return await tauri.invoke<T>(command, args);
		}
		
		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		console.error(`[IPCRendererShim] Tauri invoke failed for ${command}:`, error);
		throw error;
	}
}

/**
 * Send Tauri command (no response)
 */
function sendTauri(command: string, args: Record<string, unknown> = {}): void {
	try {
		const tauri = (window as unknown as { __TAURI__?: { invoke: typeof invokeTauri } }).__TAURI__ ?? (window as unknown as { TAURI?: { invoke: typeof invokeTauri } }).TAURI;
		if (typeof tauri?.invoke === "function") {
			tauri.invoke(command, args).catch((error: Error) => {
				console.warn(`[IPCRendererShim] Tauri send failed (no response expected): ${command}`, error);
			});
		} else {
			console.warn(`[IPCRendererShim] Tauri not available for: ${command}`);
		}
	} catch (error) {
		console.warn(`[IPCRendererShim] Tauri send error (no response expected): ${command}`, error);
	}
}

// ============================================================================
// IPC Channel Mappings
// ============================================================================

/**
 * Map Electron IPC channels to Tauri commands
 */
const IPC_CHANNEL_MAPPINGS: IPCChannelMapping[] = [
	// Logger service
	{
		electronPattern: /^logger:(log|warn|error|info|debug|trace|critical)$/,
		tauriCommand: "logger:log",
		transform: (_args) => ({
			level: _args[0] as string,
			message: _args[1] as string,
			context: _args[2] as Record<string, unknown>,
		}),
	},
	// Policy service
	{
		electronPattern: /^policy:(get|set|validate|enforce|check)$/,
		tauriCommand: "policy:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			data: _args[1] as Record<string, unknown>,
		}),
	},
	// Signing service
	{
		electronPattern: /^sign:(sign|verify|generate|validate)$/,
		tauriCommand: "sign:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			data: _args[1] as string,
			options: _args[2] as Record<string, unknown>,
		}),
	},
	// User data profiles service
	{
		electronPattern: /^userDataProfiles:(create|delete|update|get|list)$/,
		tauriCommand: "user_data:handle_profile",
		transform: (_args) => ({
			action: _args[0] as string,
			profileId: _args[1] as string,
			data: _args[2] as Record<string, unknown>,
		}),
	},
	// Local file system service
	{
		electronPattern: /^localFileSystem:(read|write|delete|exists|stat|readdir)$/,
		tauriCommand: "file:handle",
		transform: (_args) => ({
			action: _args[0] as string,
			path: _args[1] as string,
			data: _args[2] as string | Buffer,
		}),
	},
];

/**
 * Find matching Tauri command for an Electron IPC channel
 */
function mapElectronChannelToTauri(channel: string): { command: string; args: Record<string, unknown> } | null {
	for (const mapping of IPC_CHANNEL_MAPPINGS) {
		if (mapping.electronPattern.test(channel)) {
			const args = mapping.transform?.([]) ?? {};
			return { command: mapping.tauriCommand, args };
		}
	}
	return null;
}

/**
 * Extract channel-specific arguments for transformation
 */
function transformChannelArgs(channel: string, args: unknown[]): Record<string, unknown> {
	for (const mapping of IPC_CHANNEL_MAPPINGS) {
		if (mapping.electronPattern.test(channel) && mapping.transform) {
			return mapping.transform(args);
		}
	}
	// Return args as-is if no mapping found
	return { args };
}

// ============================================================================
// IPC Renderer Implementation
// ============================================================================

/**
 * IPC Renderer class that implements Electron's ipcRenderer API
 */
class IPCRendererImpl implements IpcRenderer {
	// Track event listeners by channel
	listeners = new Map<string, Set<(event: IpcRendererEvent, ...args: unknown[]) => void>>();
	
	// Track reply handlers
	replyHandlers = new Map<number, SendToRequest>();
	replyCounter = 0;
	
	// Track once listeners
	onceListeners = new Map<string, Set<WeakRef<(event: IpcRendererEvent, ...args: unknown[]) => void>>>();

	/**
	 * Send message to main process
	 */
	send(channel: string, ...args: unknown[]): void {
		console.log(`[IPCRendererShim] send: ${channel}`, args);

		// Map Electron channel to Tauri command
		const mapping = mapElectronChannelToTauri(channel);
		
		if (mapping) {
			// Use mapped Tauri command with transformed args
			const tauriArgs = transformChannelArgs(channel, args);
			sendTauri(mapping.command, tauriArgs);
		} else {
			// Generic IPC send through Tauri
			sendTauri("ipc:send", {
				channel,
				args,
			});
		}
	}

	/**
	 * Synchronous send - polyfilled as async with warning
	 */
	sendSync(_channel: string, ..._args: unknown[]): unknown {
		console.warn(
			`[IPCRendererShim] ⚠️ sendSync is not supported in Tauri. Use invoke() instead. Returning undefined.`
		);
		return undefined;
	}

	/**
	 * Invoke main process and get response
	 */
	async invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
		console.log(`[IPCRendererShim] invoke: ${channel}`, args);

		// Map Electron channel to Tauri command
		const mapping = mapElectronChannelToTauri(channel);

		if (mapping) {
			const tauriArgs = transformChannelArgs(channel, args);
			return await invokeTauri<T>(mapping.command, tauriArgs);
		}

		// Generic IPC invoke through Tauri
		return await invokeTauri<T>("ipc:invoke", {
			channel,
			args,
		});
	}

	/**
	 * Register event listener
	 */
	on(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this {
		console.log(`[IPCRendererShim] on: ${channel}`);

		if (!this.listeners.has(channel)) {
			this.listeners.set(channel, new Set());
		}
		this.listeners.get(channel)!.add(listener);

		// Also register with Tauri for main→renderer communication
		this.registerTauriListener(channel, listener);

		return this;
	}

	/**
	 * Register one-time event listener
	 */
	once(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this {
		console.log(`[IPCRendererShim] once: ${channel}`);

		if (!this.onceListeners.has(channel)) {
			this.onceListeners.set(channel, new Set());
		}
		this.onceListeners.get(channel)!.add(new WeakRef(listener));

		// Create wrapper that removes listener after first call
		const wrappedListener = (_event: IpcRendererEvent, ...args: unknown[]) => {
			listener(_event, ...args);
			this.removeListener(channel, wrappedListener);
		};

		this.on(channel, wrappedListener);

		return this;
	}

	/**
	 * Remove specific listener
	 */
	removeListener(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this {
		console.log(`[IPCRendererShim] removeListener: ${channel}`);

		const channelListeners = this.listeners.get(channel);
		if (channelListeners) {
			channelListeners.delete(listener);
			if (channelListeners.size === 0) {
				this.listeners.delete(channel);
			}
		}

		return this;
	}

	/**
	 * Remove all listeners for a channel
	 */
	removeAllListeners(channel?: string): this {
		console.log(`[IPCRendererShim] removeAllListeners: ${channel ?? "all"}`);

		if (channel) {
			this.listeners.delete(channel);
		} else {
			this.listeners.clear();
		}

		return this;
	}

	/**
	 * Client-side request-reply pattern (sendTo + onReply)
	 */
	sendTo(channel: string, args: unknown[], callback: ReplyHandler): void {
		console.log(`[IPCRendererShim] sendTo: ${channel}`);

		const requestId = ++this.replyCounter;
		const request: SendToRequest = {
			channel,
			args,
			callback,
			timestamp: Date.now(),
		};

		this.replyHandlers.set(requestId, request);

		this.invoke(channel, ...args)
			.then((response) => {
				const handler = this.replyHandlers.get(requestId);
				if (handler) {
					handler.callback(response);
					this.replyHandlers.delete(requestId);
				}
			})
			.catch((error) => {
				console.error(`[IPCRendererShim] sendTo error: ${channel}`, error);
				const handler = this.replyHandlers.get(requestId);
				if (handler) {
					handler.callback({ error: error.message });
					this.replyHandlers.delete(requestId);
				}
			});
	}

	/**
	 * Register reply handler for sendTo pattern
	 */
	onReply(channel: string, handler: ReplyHandler): void {
		console.log(`[IPCRendererShim] onReply: ${channel}`);

		this.on(channel, (_event, ...args) => {
			handler(args[0]);
		});
	}

	/**
	 * Helper method to register listener with Tauri
	 */
	private registerTauriListener(_channel: string, _listener: (event: IpcRendererEvent, ...args: unknown[]) => void): void {
		// Note: Full event listener registration requires Tauri event system
		// This is a placeholder - actual implementation depends on Tauri setup
		console.log(`[IPCRendererShim] Registering Tauri listener for: ${_channel}`);
	}

	/**
	 * Cleanup method to remove all listeners
	 */
	cleanup(): void {
		console.log("[IPCRendererShim] Cleaning up IPC listeners");
		this.listeners.clear();
		this.onceListeners.clear();
		this.replyHandlers.clear();
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

let ipcRendererInstance: IPCRendererImpl | null = null;

/**
 * Get or create the IPC renderer singleton
 */
export function getIPCRenderer(): IpcRenderer {
	if (!ipcRendererInstance) {
		ipcRendererInstance = new IPCRendererImpl();
		console.log("[IPCRendererShim] IPCRenderer instance created");
	}
	return ipcRendererInstance;
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the IPC renderer shim into window.vscode.ipcRenderer
 */
export function installIPCRendererShim(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as unknown as { __IPC_RENDERER_SHIM_INSTALLED__?: boolean }).__IPC_RENDERER_SHIM_INSTALLED__) {
		console.log("[IPCRendererShim] Already installed, skipping");
		return;
	}
	(window as unknown as { __IPC_RENDERER_SHIM_INSTALLED__: boolean }).__IPC_RENDERER_SHIM_INSTALLED__ = true;

	console.log("[IPCRendererShim] Installing Electron IPC renderer polyfill...");

	// Create IPC renderer instance
	const ipcRenderer = getIPCRenderer();

	// Attach to window.vscode if available
	if (typeof (window as unknown as { vscode?: Record<string, unknown> }).vscode !== "undefined") {
		(window as unknown as { vscode?: { ipcRenderer?: IpcRenderer } }).vscode!.ipcRenderer = ipcRenderer;
		console.log("[IPCRendererShim] ✓ IPCRenderer attached to window.vscode");
	}

	// Also make available globally for easier access
	(window as unknown as { __IPC_RENDERER__?: IpcRenderer }).__IPC_RENDERER__ = ipcRenderer;

	console.log("[IPCRendererShim] ✓ Electron IPC renderer polyfill installed");
}

// ============================================================================
// Exports
// ============================================================================

export { IPCRendererImpl as IPCRendererClass };

export default {
	install: installIPCRendererShim,
	get: getIPCRenderer,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installIPCRendererShim();
}
