/**
 * @module Bridge (Wind)
 * @description This script runs in the webview at a very early stage. Its
 * primary purpose is to create and expose a global `window.vscode` object.
 * This object shims the essential APIs that VS Code's sandboxed workbench code
 * expects from an Electron environment, redirecting them to use Tauri's IPC.
 */

import {
	listen as TauriListen,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
import { URI } from "vs/base/common/uri.js";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes.js";
import type { IMainWindowSandboxGlobals } from "vs/base/parts/sandbox/electron-sandbox/globals.js";

/**
 * A shim for the `ipcRenderer` object, adapting it to use Tauri's IPC.
 */
const CreateIpcRendererShim = (): IpcRenderer => ({
	send: (Channel: string, ...Arguments: any[]): void => {
		if (Channel.startsWith("vscode:")) {
			TauriInvoke("mountain_ipc_bridge_send", {
				Channel,
				ArgumentsList: Arguments,
			}).catch((Error: any) =>
				console.error(
					`[Bridge] Error in send for '${Channel}':`,
					Error,
				),
			);
		}
	},
	invoke: async (Channel: string, ...Arguments: any[]): Promise<any> => {
		if (Channel.startsWith("vscode:")) {
			const Command = `vscode_ipc:${Channel.substring(7)}`;
			try {
				return await TauriInvoke(Command, { Arguments });
			} catch (Error) {
				console.error(`[Bridge] Error invoking '${Command}':`, Error);
				throw Error;
			}
		}
		throw new Error(`[Bridge] Unsupported invoke channel: ${Channel}`);
	},
	on: (
		Channel: string,
		Listener: (Event: IpcRendererEvent, ...Arguments: any[]) => void,
	): IpcRenderer => {
		TauriListen(Channel, (Event: TauriEvent<any>) =>
			Listener({} as IpcRendererEvent, Event.payload),
		).catch(console.error);
		return CreateIpcRendererShim(); // Return self for chaining
	},
	// Stubs for other methods
	once: () => CreateIpcRendererShim(),
	removeListener: () => CreateIpcRendererShim(),
});

/**
 * Asynchronously fetches and prepares the workbench configuration.
 */
const ResolveConfiguration = async (): Promise<ISandboxConfiguration> => {
	try {
		const RawConfig = (await TauriInvoke(
			"mountain_get_workbench_configuration",
		)) as any;

		// Recursively revive all URI-like objects in the configuration payload.
		const ReviveUris = (Data: any): any => {
			if (!Data || typeof Data !== "object") {
				return Data;
			}
			if (Array.isArray(Data)) {
				return Data.map(ReviveUris);
			}
			if (Data.scheme && Data.path) {
				return URI.revive(Data);
			}
			for (const Key in Data) {
				if (Object.prototype.hasOwnProperty.call(Data, Key)) {
					Data[Key] = ReviveUris(Data[Key]);
				}
			}
			return Data;
		};

		return ReviveUris(RawConfig);
	} catch (Error) {
		console.error(
			"[Bridge] FATAL: Could not fetch workbench configuration from host.",
			Error,
		);
		// In a real scenario, we might have a fallback configuration.
		// For now, we throw to halt execution as the workbench cannot start.
		throw new Error("Failed to resolve initial workbench configuration.");
	}
};

/**
 * Main IIFE to set up the global `window.vscode` bridge.
 */
(async () => {
	try {
		const Configuration = await ResolveConfiguration();

		const Globals: IMainWindowSandboxGlobals = {
			ipcRenderer: CreateIpcRendererShim(),
			process: CreateProcessShim(Configuration),
			context: {
				configuration: () => Configuration,
			},
			// Stubs for other expected properties
			webFrame: { setZoomLevel: () => {} },
			webUtils: { getPathForFile: (file: File) => (file as any).path },
			ipcMessagePort: { acquire: () => {} },
		};

		// Attach the globals to the window object for the workbench script to find.
		(window as any).vscode = Globals;

		console.log(
			"[Wind Bridge] Successfully attached vscode shims to the window object.",
		);
	} catch (Error) {
		const ErrorMessage =
			Error instanceof Error ? Error.message : String(Error);
		console.error("[Wind Bridge] FATAL: Failed to initialize.", Error);
		// Display an error overlay if initialization fails.
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
