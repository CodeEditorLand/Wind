/**
 * @module Function/Install/Function/Install
 * @description
 * Main entry point for Wind polyfill installation.
 * Creates and attaches Electron API shims to window.vscode that Electron workbench expects.
 *
 * @responsibilities
 * - Validates window context and prevents double initialization
 * - Creates VSCode-compatible globals with proper typing
 * - Handles Mountain backend communication with graceful degradation
 * - Implements Electron-like IPC subsystem with Tauri
 * - Provides comprehensive error handling and cleanup
 *
 * @see {@link Function/Install/Function/ResolveConfiguration} Configuration resolver
 * @see {@link Function/Install/Function/CreateIPCRenderer} IPC renderer factory
 * @see {@link Function/Install/Function/CreateProcess} Process factory
 * @category Function
 */

import type { IMainWindowSandboxGlobals } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";

import { CreateIPCRenderer } from "./CreateIPCRenderer.js";
import { CreateProcess } from "./CreateProcess.js";
import { Fallback } from "./Fallback.js";
import { ResolveConfiguration } from "./ResolveConfiguration.js";

/**
 * Main Wind preload installation function
 */
export default async function Install(): Promise<void> {
	try {
		// Validate window context
		if (typeof window === "undefined") {
			const error = new Error(
				"Cannot install Wind polyfill: window is not defined",
			);
			console.error(error);
			return;
		}

		// Prevent double initialization
		if (
			(window as unknown as { polyfillInstalled?: boolean })
				.polyfillInstalled
		) {
			return;
		}
		(
			window as unknown as { polyfillInstalled: boolean }
		).polyfillInstalled = true;

		console.log("[Wind] Starting Wind preload installation...");

		// Initialize core components
		const Configuration = await ResolveConfiguration();
		const IPCRenderer = CreateIPCRenderer();
		const Process = CreateProcess(Configuration);

		// Create preload globals object that will be enhanced by Effect-TS
		const preloadGlobals = {
			ipcRenderer: IPCRenderer,
			process: Process,
			configuration: Configuration,
		};

		// Attach preloadGlobals to window for Effect-TS services to access
		(window as any).preloadGlobals = preloadGlobals;
		console.log("[Wind] preloadGlobals attached to window");

		// Construct compliant VSCode API object
		const Globals: IMainWindowSandboxGlobals = {
			ipcRenderer: IPCRenderer,
			process: Process,
			context: {
				configuration: () => Configuration,
				resolveConfiguration: async () => Configuration,
			},
			webFrame: { setZoomLevel: () => {} },
			webUtils: { getPathForFile: (file: File) => file.name },
			ipcMessagePort: { acquire: () => {} },
		};

		// Attach to window
		(window as any).vscode = Globals;
		console.info(
			"[Wind] Successfully installed Electron API polyfill for workbench.",
		);

		// Signal that preload is ready for Effect-TS bootstrap
		(window as any).__WIND_PRELOAD_READY__ = true;
		console.log("[Wind] Preload ready, Effect-TS bootstrap can proceed");
	} catch (error: unknown) {
		console.error(`[Wind] Install error:`, error);
		Fallback();
	}
}
