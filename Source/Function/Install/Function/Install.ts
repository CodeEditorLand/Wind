/**
 * @module Function/Install/Function/Install
 *
 * Main entry point for Wind polyfill installation.
 * Creates and attaches Electron API shims to window.vscode.
 *
 * Zero console.* output. Dev tracing via performance.mark().
 */

import type { IMainWindowSandboxGlobals } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/sandbox/electron-browser/globals.js";

import { CreateIPCRenderer } from "./CreateIPCRenderer.js";
import { CreateProcess } from "./CreateProcess.js";
import { Fallback } from "./Fallback.js";
import { ResolveConfiguration } from "./ResolveConfiguration.js";

const _Trace = (Message: string): void => {
	try {
		performance.mark(`land:install:${Message}`);
	} catch {}
};

export default async function Install(): Promise<void> {
	try {
		if (typeof window === "undefined") return;

		if (
			(window as unknown as { polyfillInstalled?: boolean })
				.polyfillInstalled
		) {
			return;
		}

		(
			window as unknown as { polyfillInstalled: boolean }
		).polyfillInstalled = true;

		_Trace("start");

		const Configuration = await ResolveConfiguration();

		const IPCRenderer = CreateIPCRenderer();

		const Process = CreateProcess(Configuration);

		const preloadGlobals = {
			ipcRenderer: IPCRenderer,

			process: Process,

			configuration: Configuration,
		};

		(window as any).preloadGlobals = preloadGlobals;

		const Globals: IMainWindowSandboxGlobals = {
			ipcRenderer: IPCRenderer,

			process: Process,

			context: {
				configuration: () => Configuration,

				resolveConfiguration: async () => Configuration,
			},

			webFrame: { setZoomLevel: () => {} },

			webUtils: { getPathForFile: (file: File) => file.name },

			ipcMessagePort: {
				acquire: (ResponseChannel: string, Nonce: string) => {
					_Trace(`acquire:${ResponseChannel}`);

					const IsExtensionHost = ResponseChannel.includes(
						"startExtensionHostMessagePortResult",
					);

					const { port1, port2 } = new MessageChannel();

					window.postMessage(Nonce, "*", [port2]);

					if (IsExtensionHost) {
						port1.start();

						let Done = false;

						port1.onmessage = (Event: MessageEvent) => {
							if (Done) return;

							const Data = Event.data;

							const Length =
								Data instanceof ArrayBuffer
									? Data.byteLength
									: Data instanceof Uint8Array
										? Data.byteLength
										: 0;

							if (Length > 1) {
								Done = true;

								port1.postMessage(new Uint8Array([1]));
							}
						};

						setTimeout(() => {
							port1.postMessage(new Uint8Array([2]));
						}, 50);
					}
				},
			},
		};

		(window as any).vscode = Globals;

		(window as any).__WIND_PRELOAD_READY__ = true;

		_Trace("done");
	} catch (error: unknown) {
		try {
			performance.mark(`land:install:error`);
		} catch {}

		Fallback();
	}
}
