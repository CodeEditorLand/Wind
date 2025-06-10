/**
 * @module Preload (Wind)
 * @description This preload script runs in the webview environment before any other
 * scripts. Its primary responsibility is to bridge the gap between the sandboxed
 * web content and the native capabilities provided by the Tauri host (`Mountain`).
 * It achieves this by creating shims for the Node.js/Electron-specific globals
 * that the VS Code workbench code expects to find, such as `process` and `ipcRenderer`.
 */

import {
	emit as TauriEmit,
	listen as TauriListen,
	once as TauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { URI } from "vs/base/common/uri.js";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes.js";
import type {
	IMainWindowSandboxGlobals,
	ISandboxNodeProcess,
} from "vs/base/parts/sandbox/electron-sandbox/globals.js";

// --- Global Declaration for window.vscode ---
// This informs the TypeScript compiler that our custom global will exist.
declare global {
	interface Window {
		vscode: IMainWindowSandboxGlobals;
	}
}

// --- IPC Renderer Shim ---
// Translates the `ipcRenderer` API that VS Code expects into Tauri events and commands.
const IpcRendererShim: IpcRenderer = {
	send: (Channel: string, ...Args: any[]) => {
		// For security, only allow sending on channels prefixed with 'vscode:'.
		if (Channel.startsWith("vscode:")) {
			TauriEmit(Channel, Args.length === 1 ? Args[0] : Args).catch(
				console.error,
			);
		}
	},

	invoke: async (Channel: string, ...Args: any[]): Promise<any> => {
		if (Channel.startsWith("vscode:")) {
			// The `track` module in Mountain will listen for commands in this format.
			const Command = `vscode_ipc:${Channel.substring(7)}`;
			try {
				return await TauriInvoke(Command, { Args });
			} catch (error) {
				console.error(
					`[Preload] Error invoking command '${Command}':`,
					error,
				);
				throw error;
			}
		}
		throw new Error(`[Preload] Unsupported IPC invoke channel: ${Channel}`);
	},

	on: (
		Channel: string,
		Listener: (event: IpcRendererEvent, ...args: any[]) => void,
	): IpcRenderer => {
		if (Channel.startsWith("vscode:")) {
			TauriListen(Channel, (Event: TauriEvent<any>) =>
				Listener({} as IpcRendererEvent, Event.payload),
			).catch(console.error);
		}
		return IpcRendererShim;
	},

	once: (
		Channel: string,
		Listener: (event: IpcRendererEvent, ...args: any[]) => void,
	): IpcRenderer => {
		if (Channel.startsWith("vscode:")) {
			TauriOnce(Channel, (Event: TauriEvent<any>) =>
				Listener({} as IpcRendererEvent, Event.payload),
			).catch(console.error);
		}
		return IpcRendererShim;
	},

	removeListener: (
		_Channel: string,
		_Listener: (...args: any[]) => void,
	): IpcRenderer => {
		console.warn(
			`[Preload] ipcRenderer.removeListener for '${_Channel}' is a no-op in the Tauri shim.`,
		);
		return IpcRendererShim;
	},
};

// --- Main Preload IIFE (Immediately Invoked Function Expression) ---
(async () => {
	try {
		// Create a shim for the `process` object by fetching data from the host.
		const ProcessShim: ISandboxNodeProcess = {
			platform: await TauriInvoke("process_get_platform"),
			arch: await TauriInvoke("process_get_arch"),
			type: "renderer",
			versions: {
				node: "18.18.2", // A representative Node.js version
				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ??
					"unknown",
				electron: "0.0.0-tauri", // Explicitly signal we are not in Electron
			},
			env: await TauriInvoke("process_get_env"),
			pid: await TauriInvoke("process_get_pid"),
			cwd: () => ProcessShim.env.VSCODE_CWD || "/",
			on: (_event, _callback) => ProcessShim, // Return self for chaining, as expected by some VS Code code
			getProcessMemoryInfo: async () => ({
				private: 0,
				residentSet: 0,
				shared: 0,
			}),
			shellEnv: async () => await TauriInvoke("process_get_shell_env"),
			execPath: await TauriInvoke("process_get_exec_path"),
		};

		// Create a function to resolve the initial workbench configuration.
		const ResolveConfiguration = (): ISandboxConfiguration => {
			const ConfigElement = document.getElementById(
				"vscode-workbench-web-configuration",
			);
			if (!ConfigElement)
				throw new Error(
					"Could not find workbench configuration element in index.html.",
				);

			const ConfigData = JSON.parse(
				ConfigElement.dataset.settings ?? "{}",
			);

			// Recursively revive all URI-like objects in the configuration payload.
			const ReviveUris = (data: any): any => {
				if (!data || typeof data !== "object") return data;
				if (Array.isArray(data)) return data.map(ReviveUris);
				// This check identifies objects that were serialized from VS Code URIs.
				if (data.scheme && data.path) return URI.revive(data);
				for (const key in data) {
					if (Object.prototype.hasOwnProperty.call(data, key)) {
						data[key] = ReviveUris(data[key]);
					}
				}
				return data;
			};

			return ReviveUris(ConfigData);
		};

		// Assemble the final `window.vscode` global object.
		const Globals: IMainWindowSandboxGlobals = {
			process: ProcessShim,
			ipcRenderer: IpcRendererShim,
			webFrame: { setZoomLevel: (level) => appWindow.setZoom(level) },
			context: { resolveConfiguration: ResolveConfiguration },
			webUtils: { getPathForFile: (file) => (file as any).path }, // Simplified for web compatibility
			ipcMessagePort: {
				acquire: () =>
					console.warn("ipcMessagePort.acquire is not implemented."),
			},
		};

		// Attach the globals to the window object for the workbench script to find.
		window.vscode = Globals;

		console.log(
			"[Wind Preload] Successfully attached vscode shims to the window object.",
		);
	} catch (error) {
		console.error(
			"[Wind Preload] FATAL: Failed to initialize preload script.",
			error,
		);
		const ErrorDiv = document.createElement("div");
		ErrorDiv.textContent = `Preload Error: ${error instanceof Error ? error.message : String(error)}. Check developer console for details.`;
		ErrorDiv.setAttribute(
			"style",
			"color:red;padding:20px;font-family:sans-serif;white-space:pre-wrap;z-index:9999;position:fixed;top:0;left:0;width:100%;background:pink;border-bottom:2px solid darkred;",
		);
		document.addEventListener("DOMContentLoaded", () =>
			document.body.prepend(ErrorDiv),
		);
	}
})();
