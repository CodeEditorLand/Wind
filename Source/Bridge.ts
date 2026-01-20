/**
 * @module Bridge (Wind)
 * @description This script runs in the webview environment at a very early
 * stage. Its primary purpose is to create and expose a global `window.vscode`
 * object. This object shims the essential APIs that VS Code's sandboxed
 * workbench code expects from an Electron environment, redirecting them to use
 * Tauri's IPC mechanism.
 */

import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	ISandboxNodeProcess,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";
import { invoke as TauriInvoke } from "@tauri-apps/api/core";
import {
	emit as TauriEmit,
	listen as TauriListen,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";

/**
 * A shim for the `ipcRenderer` object, adapting it to use Tauri's IPC.
 * This function creates a proxy that translates VS Code's IPC calls into
 * Tauri commands and events.
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
		Listener: (event: IpcRendererEvent, ...args: any[]) => void,
	) => {
		TauriListen(Channel, (Event: TauriEvent<any>) =>
			Listener({} as IpcRendererEvent, Event.payload),
		).catch(console.error);
		// Return self for chaining, as expected by the IpcRenderer interface.
		return CreateIpcRendererShim();
	},
	// Stubs for other Emitter methods to fulfill the interface.
	once: () => CreateIpcRendererShim(),
	removeListener: () => CreateIpcRendererShim(),
	emit: (channel: string, ...args: any[]) => {
		TauriEmit(channel, ...args).catch(console.error);
		return true;
	},
});

/**
 * Asynchronously fetches and prepares the workbench configuration from the
 * native host (`Mountain`). It also revives any URI-like objects within the
 * configuration into proper `URI` instances.
 * @returns A promise that resolves to the `ISandboxConfiguration`.
 */
const ResolveConfiguration = async (): Promise<ISandboxConfiguration> => {
	try {
		const RawConfig = (await TauriInvoke(
			"mountain_get_workbench_configuration",
		)) as any;

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
		throw new Error("Failed to resolve initial workbench configuration.");
	}
};

/**
 * Creates a shim for the `process` object using static configuration data
 * fetched from the host.
 * @param Configuration The sandbox configuration from the host.
 * @returns An object that shims the `ISandboxNodeProcess` interface.
 */
const CreateProcessShim = (
	Configuration: ISandboxConfiguration,
): ISandboxNodeProcess => ({
	...Configuration.userEnv,
	pid: -1,
	arch: Configuration.arch as string,
	platform: Configuration.platform as NodeJS.Platform,
	type: "renderer",
	cwd: () => Configuration.cwd,
	env: { ...Configuration.userEnv },
	versions: Configuration.versions as NodeJS.ProcessVersions,
	getProcessMemoryInfo: () =>
		Promise.resolve({
			residentSet: 0,
			private: 0,
			shared: 0,
		}),
	sandboxed: true,
});

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
