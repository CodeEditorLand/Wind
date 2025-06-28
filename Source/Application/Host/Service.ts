/**
 * @module Service (Application/Host)
 * @description Defines the service interface and live implementation for the HostService.
 * This service is the primary bridge between the webview UI and the native host,
 * responsible for providing essential shims and proxying native UI calls.
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
	ISaveDialogResult,
} from "vs/platform/dialogs/common/dialogs.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { HostServiceProblem } from "./Error.js";

/**
 * The `HostService` is the primary bridge between the Wind application and the
 * native `Mountain` host. It encapsulates all direct communication (IPC) and
 * provides a clean, Effect-native interface for other services to use.
 */
interface Host {
	/** The resolved sandbox configuration received from the host upon startup. */
	readonly Configuration: ISandboxConfiguration;

	/** An Effect that performs the side-effect of attaching the `window.vscode` global object. */
	readonly ProvideGlobals: () => Effect.Effect<void, HostServiceProblem>;

	/** Notifies the native host that the workbench is ready and operational. */
	readonly NotifyReady: () => Effect.Effect<void, HostServiceProblem>;

	/** Shows a native dialog for opening files or folders. */
	readonly ShowOpenDialog: (
		Options: INativeOpenDialogOptions,
	) => Effect.Effect<Option.Option<readonly URI[]>, HostServiceProblem>;

	/** Shows a native dialog for saving a file. */
	readonly ShowSaveDialog: (
		Options: INativeSaveDialogOptions,
	) => Effect.Effect<Option.Option<URI>, HostServiceProblem>;

	/** Shows a native confirmation dialog for saving dirty files. */
	readonly ShowSaveConfirm: (
		Files: UriComponents[],
	) => Effect.Effect<ISaveDialogResult, HostServiceProblem>;

	/** Requests that the host open a file. */
	readonly OpenFile: (Uri: URI) => Effect.Effect<void, HostServiceProblem>;
}

/**
 * A factory function that creates a shim for the `ipcRenderer` object,
 * adapting its methods to use the `IntegrationService`.
 */
const CreateIpcRendererShim = (
	Integration: IntegrationService,
): IpcRenderer => ({
	invoke: (Channel: string, ...Arguments: any[]) =>
		Effect.runPromise(
			Integration.Invoke("DispatchFrontendCommand", {
				command: Channel,
				argument: Arguments,
			}),
		),
	on: (Channel, Listener) =>
		Effect.runFork(Integration.Listen(Channel, Listener)),
	send: (Channel, ...Arguments: any[]) =>
		Effect.runFork(Integration.Emit(Channel, Arguments)),
});

/**
 * A factory function that creates a shim for the `process` object using
 * static configuration data fetched from the host.
 */
const CreateProcessShim = (Configuration: ISandboxConfiguration): IProcess => ({
	...Configuration.userEnv,
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
 * The `Effect.Service` for the Host service.
 */
export class HostService extends Effect.Service<Host>()("wind/HostService", {
	effect: Effect.gen(function* (Generator) {
		const Integration = yield* Generator(IntegrationService);

		const Configuration = yield* Generator(
			Integration.Invoke<ISandboxConfiguration>(
				"MountainGetWorkbenchConfiguration",
			).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "FailedToFetchInitialConfiguration",
						}),
				),
			),
		);

		const ProvideGlobals = () =>
			Effect.sync(() => {
				(window as any).vscode = {
					ipcRenderer: CreateIpcRendererShim(Integration),
					process: CreateProcessShim(Configuration),
				};
			}).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "FailedToProvideGlobals",
						}),
				),
			);

		const NotifyReady = () =>
			Integration.Emit("sky://lifecycle/ready").pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "FailedToNotifyHostReady",
						}),
				),
			);

		const ShowOpenDialog = (Options: INativeOpenDialogOptions) =>
			Integration.Invoke<UriComponents[] | null>(
				"UserInterface.ShowOpenDialog",
				Options,
			).pipe(
				Effect.map(Option.fromNullable),
				Effect.map(Option.map((Uris) => Uris.map(URI.revive))),
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowOpenDialogFailed",
						}),
				),
			);

		const ShowSaveDialog = (Options: INativeSaveDialogOptions) =>
			Integration.Invoke<UriComponents | null>(
				"UserInterface.ShowSaveDialog",
				Options,
			).pipe(
				Effect.map(Option.fromNullable),
				Effect.map(Option.map(URI.revive)),
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowSaveDialogFailed",
						}),
				),
			);

		const ShowSaveConfirm = (Files: UriComponents[]) =>
			Integration.Invoke<ISaveDialogResult>(
				"UserInterface.ShowSaveConfirm",
				Files,
			).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowSaveConfirmFailed",
						}),
				),
			);

		const OpenFile = (Uri: URI) =>
			Integration.Invoke<void>("WorkSpace.OpenFile", Uri.fsPath).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "OpenFileFailed",
						}),
				),
			);

		return {
			Configuration,
			ProvideGlobals,
			NotifyReady,
			ShowOpenDialog,
			ShowSaveDialog,
			ShowSaveConfirm,
			OpenFile,
		};
	}),
}) {}
