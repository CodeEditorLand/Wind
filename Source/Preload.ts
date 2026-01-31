/**
 * @module Preload
 * @description
 * Atomic preload script - exposes window.vscode with minimal surface area.
 * All heavy lifting moved to Effect services.
 */

import { emit, invoke, listen } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";

// ============================================================================
// Atom: Cleanup registry for event listeners
// ============================================================================

const cleanupMap = new Map<string, () => void>();

// ============================================================================
// Atom: Tauri Availability Check
// ============================================================================

const isTauri =
	typeof window !== "undefined" && (window as any).__TAURI__ !== undefined;

// ============================================================================
// Atom: IPC Renderer (minimal wrapper)
// ============================================================================

const ipcRenderer = {
	send: (channel: string, ...args: unknown[]) => {
		emit(channel, args.length === 1 ? args[0] : args);
	},

	invoke: async (channel: string, ...args: unknown[]): Promise<unknown> => {
		return invoke(channel, args.length === 1 ? args[0] : args);
	},

	on: (
		channel: string,
		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		listen(channel, (event) => {
			listener(event, event.payload);
		}).then((unlisten) => {
			const cleanup = () => unlisten();
			cleanupMap.set(channel, cleanup);
		});
	},

	once: (
		channel: string,
		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		listen(
			channel,
			(event) => {
				listener(event, event.payload);
			},
			{ once: true },
		);
	},

	removeListener: (
		channel: string,
		_listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		const cleanup = cleanupMap.get(channel);
		if (cleanup) {
			cleanup();
			cleanupMap.delete(channel);
		}
	},

	removeAllListeners: (channel: string) => {
		const cleanup = cleanupMap.get(channel);
		if (cleanup) {
			cleanup();
			cleanupMap.delete(channel);
		}
	},
};

// ============================================================================
// Atom: MessagePort (placeholder - TODO: implement with MessageChannel)
// ============================================================================

const ipcMessagePort = {
	acquire: (responseChannel: string, nonce: string) => {
		// TODO: Implement proper MessageChannel for VSCode SharedProcessWorker
		console.log(
			`[Preload] MessagePort acquire requested: ${responseChannel}, ${nonce}`,
		);

		// For now, signal that ports are not available
		// This will need proper implementation for full VSCode compatibility
		setTimeout(() => {
			ipcRenderer.send(responseChannel, nonce);
		}, 0);
	},
};

// ============================================================================
// Atom: WebFrame
// ============================================================================

const webFrame = {
	setZoomLevel: (level: number) => {
		// Tauri doesn't have direct webFrame control, use CSS transform
		document.documentElement.style.setProperty(
			"--zoom-level",
			String(level),
		);
		console.log(`[Preload] Zoom level set to: ${level}`);
	},
};

// ============================================================================
// Atom: Process (environment and info)
// ============================================================================

const process = {
	platform: (navigator.platform || "unknown").toLowerCase().includes("win")
		? "win32"
		: (navigator.platform || "unknown").toLowerCase().includes("mac")
			? "darwin"
			: "linux",
	arch: "x64", // TODO: Detect from Tauri
	env: {},
	versions: {
		node: "20.0.0", // Placeholder
		chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "unknown",
		electron: "30.0.0", // Placeholder for compatibility
	},
	cwd: () => "/app",
	shellEnv: async () => ({}),
	getProcessMemoryInfo: async () => ({
		workingSetSize: 0,
		peakWorkingSetSize: 0,
		privateBytes: 0,
		sharedBytes: 0,
	}),
	on: (_type: string, _callback: (error: Error) => void) => {
		// No-op in browser context
	},
};

// ============================================================================
// Atom: Configuration (fetched from Mountain)
// ============================================================================

let cachedConfiguration: any = null;

const context = {
	configuration: async () => {
		if (cachedConfiguration) return cachedConfiguration;

		try {
			const config = await invoke("mountain_get_workbench_configuration");
			cachedConfiguration = config;
			return config;
		} catch (error) {
			console.error("[Preload] Failed to fetch configuration:", error);
			throw error;
		}
	},

	resolveConfiguration: async () => {
		return context.configuration();
	},
};

// ============================================================================
// Atom: WebUtils
// ============================================================================

const webUtils = {
	getPathForFile: (file: File): string => {
		// Tauri doesn't expose full paths for security
		// Return a pseudo-path for compatibility
		return `file://${file.name}`;
	},
};

// ============================================================================
// Atom: Globals Assembly
// ============================================================================

const globals = {
	ipcRenderer,
	ipcMessagePort,
	webFrame,
	process,
	context,
	webUtils,
};

// ============================================================================
// Atom: Expose to window
// ============================================================================

if (isTauri) {
	(window as any).vscode = globals;
	console.log("[Preload] ✅ Sandbox globals exposed to window.vscode");

	// Dispatch ready event
	window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
	console.error("[Preload] ❌ Tauri not detected - preload failed");
}

// Export for type checking
export type {};
