/*
 * File: Wind/Source/Application/Host/Definition.ts
 * Role: Provides the live implementation of the `HostService`.
 * Responsibilities:
 *   - Fetch the initial workbench configuration from the `Mountain` host.
 *   - Construct the `window.vscode` global object, which shims the APIs that
 *     the workbench expects (like `ipcRenderer` and `process`).
 *   - Mediate all communication between the frontend and the `Mountain` host
 *     via the `IntegrationService` (the Tauri IPC bridge).
 */

import { Effect, Option } from "effect";
import { URI, type UriComponents } from "vs/base/common/uri.js";
import type {
	IProcess,
	ISandboxConfiguration,
} from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type { IpcRenderer } from "vs/base/parts/sandbox/electron-sandbox/electronTypes.js";
import type {
	INativeOpenDialogOptions,
	INativeSaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs.js";

import { IntegrationService } from "../../Integration/Tauri/mod.js";
import type { HostServiceProblem } from "./Error/mod.js";
import type { Interface as HostServiceInterface } from "./Service.js";

const createIpcRendererShim = (
	Tauri: IntegrationService.Interface,
): IpcRenderer => ({
	invoke: (channel: string, ...args: any[]) =>
		Effect.runPromise(
			Tauri.invoke("DispatchFrontendCommand", {
				command: channel,

				argument: args,
			}),
		),

	on: (channel: string, listener: any) => Tauri.listen(channel, listener),

	send: (channel: string, ...args: any[]) =>
		Effect.runFork(Tauri.emit(channel, args)),
});

const createProcessShim = (Configuration: ISandboxConfiguration): IProcess => ({
	...Configuration.userEnv,

	// Not applicable
	pid: -1,

	arch: Configuration.arch,

	platform: Configuration.platform,

	type: "renderer",

	cwd: () => Configuration.VSCODE_CWD,

	env: { ...Configuration.userEnv },

	versions: Configuration.versions,

	getProcessMemoryInfo: () =>
		Promise.resolve({ total: 0, residentSet: 0, private: 0 }),

	sandboxed: true,

	mas: false,

	windows: Configuration.platform === "win32",

	linux: Configuration.platform === "linux",

	darwin: Configuration.platform === "darwin",
});

/**
 * An Effect that builds the live implementation of the HostService.
 */
const Definition = Effect.gen(function* (_) {
	const Tauri = yield* _(IntegrationService.Tag);

	// Fetch initial configuration from the host. This is a critical first step.
	const configuration = yield* _(
		Tauri.invoke<ISandboxConfiguration>(
			"MountainGetWorkbenchConfiguration",
		),
	);

	const Service: HostServiceInterface = {
		configuration,

		provideGlobals: () =>
			Effect.sync(() => {
				(window as any).vscode = {
					ipcRenderer: createIpcRendererShim(Tauri),

					process: createProcessShim(configuration),
				};
			}),

		notifyReady: () => Tauri.emit("sky://lifecycle/ready", {}),

		showOpenDialog: (options: INativeOpenDialogOptions) =>
			Tauri.invoke<UriComponents[] | null>(
				"UserInterface.ShowOpenDialog",

				options,
			).pipe(
				Effect.map(Option.fromNullable),

				Effect.map(Option.map((uris) => uris.map(URI.revive))),
			),

		showSaveDialog: (options: INativeSaveDialogOptions) =>
			Tauri.invoke<UriComponents | null>(
				"UserInterface.ShowSaveDialog",

				options,
			).pipe(
				Effect.map(Option.fromNullable),

				Effect.map(Option.map(URI.revive)),
			),

		showSaveConfirm: (files) =>
			// Stub
			Effect.succeed({ confirmed: false, acks: [] }),

		openFile: (uri) => Tauri.invoke("WorkSpace.OpenFile", uri.fsPath),
	};

	return Service;
});

export default Definition;
