// ============================================================================
// Element: Wind - 50-Level Deep Analysis
// ============================================================================
//
// Overview
// --------
// Wind is the TypeScript/Effect-TS based UI service layer.
//
// Level 1-10: Basic Structure
// ---------------------------
// | Level | Task                           | Status |
// |-------|--------------------------------|--------|
// | 1     | Verify package.json exists     | ✅     |
// | 2     | Check Source/Effect/ structure | ✅     |
// | 3     | Identify main services         | ✅     |
// | 4     | Check for TypeScript config    | ✅     |
// | 5     | Check Configuration/ directory | ✅     |
// | 6     | Check .turbo directory         | ✅     |
// | 7     | Identify Dependencies          | ✅     |
// | 8     | Check for tests/               | ⬜     |
// | 9     | Verify .github/workflows       | ⬜     |
// | 10    | Check Preload.ts               | ✅     |
//
// Level 11-20: Service Analysis
// -----------------------------
// | Level | Task                          | Status |
// |-------|-------------------------------|--------|
// | 11    | Analyze Clipboard service     | ⬜     |
// | 12    | Analyze Configuration service | ⬜     |
// | 13    | Analyze Environment service   | ⬜     |
// | 14    | Analyze Health service        | ⬜     |
// | 15    | Analyze IPC service           | ⬜     |
// | 16    | Analyze Mountain service      | ⬜     |
// | 17    | Analyze MountainSync service  | ⬜     |
// | 18    | Check FileSystem services     | ⬜     |
// | 19    | Check Function services       | ⬜     |
// | 20    | Check Workbench services      | ⬜     |
//
// Level 21-30: Service Pattern Analysis
// -------------------------------------
// | Level | Task                              | Status  |
// |-------|-----------------------------------|---------|
// | 21    | Verify Define/Implement/Problem   | ⬜     |
// | 22    | Check for old Interface/Live      | ⚠️ Mixed |
// | 23    | Check Configuration service       | ✅     |
// | 24    | Check Clipboard service           | ⚠️     |
// | 25    | Verify Layer composition          | ⬜     |
// | 26    | Verify Effect.Service patterns    | ⬜     |
// | 27    | Check IntegrationService          | ⬜     |
// | 28    | Verify TauriFileService           | ⬜     |
// | 29    | Check mock implementations        | ⬜     |
// | 30    | Verify test patterns              | ⬜     |
//
// Level 31-40: Code Quality Checks (TODOs: 4)
// --------------------------------------------
// | Level | Task                        | Status  |
// |-------|-----------------------------|---------|
// | 31    | Check for unused imports    | ⬜     |
// | 32    | Check for dead code         | ⬜     |
// | 33    | Check TODO comments (4)     | 🟢 Low |
// | 34    | Verify naming conventions   | ⬜     |
// | 35    | Check error handling        | ⬜     |
// | 36    | Verify logging patterns     | ⬜     |
// | 37    | Check for console.log       | ⬜     |
// | 38    | Verify async patterns       | ⬜     |
// | 39    | Check memory leaks          | ⬜     |
// | 40    | Verify test coverage        | ⬜     |
//
// Level 41-50: Convention Verification
// -------------------------------------
// | Level | Task                        | Status    |
// |-------|-----------------------------|-----------|
// | 41    | Verify PascalCase           | ✅ Verified |
// | 42    | Check .ts file naming       | ⬜         |
// | 43    | Check service directory structure | ⬜   |
// | 44    | Verify Problem.ts usage     | ⬜         |
// | 45    | Check Error.ts usage        | ⬜         |
// | 46    | Verify Interface.ts vs Define.ts | ⚠️    |
// | 47    | Check Live.ts vs Implement.ts | ⚠️       |
// | 48    | Verify Tag.ts usage         | ⬜         |
// | 49    | Final Wind-specific audit   | ⬜         |
// | 50    | Complete Wind analysis      | ⬜         |
//
// Pattern Migration Status
// ------------------------
// - **New Pattern (Define/Implement/Problem)**: Configuration service ✅
// - **Old Pattern (Interface/Live/Mock/Tag/Type)**: Clipboard, others ⚠️
// - **Action**: Need to migrate remaining services
//
// Summary for Wind
// ----------------
// - **Type**: TypeScript/Effect-TS
// - **TODOs**: 4 found 🟢
// - **Key Change**: Service architecture pattern (560016c)
// - **Action Needed**: Migrate remaining services to Define/Implement/Problem
//
// Last Updated: 2026-03-03
// ============================================================================

/**
 * @module Preload
 * @description
 * Atomic preload script - exposes window.vscode with minimal surface area.
 * All heavy lifting moved to Effect services.
 */

import { emit, listen } from "@tauri-apps/api/event";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";

// ============================================================================
// Atom: Cleanup registry for event listeners
// ============================================================================

const CleanupMap = new Map<string, () => void>();

// ============================================================================
// Atom: Tauri Availability Check
// ============================================================================

const IsTauri =
	typeof window !== "undefined" && (window as any).__TAURI__ !== undefined;

// ============================================================================
// Atom: IPC Renderer (minimal wrapper)
// ============================================================================

const ipcRenderer = {
	send: (channel: string, ...args: unknown[]) => {
		emit(channel, args.length === 1 ? args[0] : args);
	},

	invoke: async (channel: string, ...args: unknown[]): Promise<unknown> => {
		const invokeArgs: any = args.length === 0 ? undefined : (args.length === 1 ? args[0] : args);
		return tauriInvoke(channel, invokeArgs) as Promise<unknown>;
	},

	on: (
		channel: string,
		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		listen(channel, (event) => {
			listener(event, event.payload);
		}).then((unlisten) => {
			const Cleanup = () => unlisten();
			CleanupMap.set(channel, Cleanup);
		});
	},

	once: (
		channel: string,
		listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		const wrappedListener = (event: unknown) => {
			listener(event, (event as any).payload || event);
		};
		listen(channel, wrappedListener as any).then((Unlisten) => {
			// Remove after first call
			setTimeout(() => Unlisten(), 0);
		});
	},

	removeListener: (
		channel: string,
		_listener: (event: unknown, ...args: unknown[]) => void,
	) => {
		const Cleanup = CleanupMap.get(channel);
		if (Cleanup) {
			Cleanup();
			CleanupMap.delete(channel);
		}
	},

	removeAllListeners: (channel: string) => {
		const Cleanup = CleanupMap.get(channel);
		if (Cleanup) {
			Cleanup();
			CleanupMap.delete(channel);
		}
	},
};

// ============================================================================
// Atom: MessagePort (placeholder - FUTURE: implement with MessageChannel)
// ============================================================================

const ipcMessagePort = {
acquire: (responseChannel: string, nonce: string) => {
	// FUTURE: Implement proper MessageChannel for VSCode SharedProcessWorker
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
			arch: "x64", // FUTURE: Detect from Tauri - arch detection requires Tauri platform info
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

let CachedConfiguration: any = null;

const context = {
	configuration: async () => {
		if (CachedConfiguration) return CachedConfiguration;

		try {
			const Config = await tauriInvoke("mountain_get_workbench_configuration");
			CachedConfiguration = Config;
			return Config;
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

const Globals = {
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

if (IsTauri) {
	(window as any).vscode = Globals;
	console.log("[Preload] Sandbox globals exposed to window.vscode");

	// Dispatch ready event
	window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
	console.error("[Preload] Tauri not detected - preload failed");
}

// Export for type checking
export type {};
