/**
 * @module Service (Application/Host)
 * @description Defines the service interface and live implementation for the HostService.
 * This service is the primary bridge between the webview UI and the native host.
 */

import { Effect, Option } from "effect";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type { IpcRenderer } from "vs/base/parts/sandbox/electron-sandbox/electronTypes.js";
import type { IProcess } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	INativeOpenDialogOptions,
	INativeSaveDialogOptions,
	ISaveDialogResult,
} from "vs/platform/dialogs/common/dialogs.js";
import type { LogLevel } from "vs/platform/log/common/log.js";
import { URI, type UriComponents } from "Source/Platform/VSCode/Type.js";
import type {
	INotification,
	IPromptChoice,
	IPromptOptions,
	IStatusMessageOptions,
	NotificationMessage,
	Severity,
} from "vs/platform/notification/common/notification.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { HostServiceProblem } from "./Error.js";

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
 * The `HostService` is the primary bridge between the Wind application and the
 * native `Mountain` host.
 */
interface Host {
	readonly Configuration: ISandboxConfiguration;
	readonly ProvideGlobals: () => Effect.Effect<void, HostServiceProblem>;
	readonly NotifyReady: () => Effect.Effect<void, HostServiceProblem>;
	readonly ShowOpenDialog: (
		Options: INativeOpenDialogOptions,
	) => Effect.Effect<Option.Option<readonly URI[]>, HostServiceProblem>;
	readonly ShowSaveDialog: (
		Options: INativeSaveDialogOptions,
	) => Effect.Effect<Option.Option<URI>, HostServiceProblem>;
	readonly ShowSaveConfirm: (
		Files: UriComponents[],
	) => Effect.Effect<ISaveDialogResult, HostServiceProblem>;
	readonly OpenFile: (Uri: URI) => Effect.Effect<void, HostServiceProblem>;
	readonly Log: (
		Level: LogLevel,
		Message: string,
	) => Effect.Effect<void, HostServiceProblem>;

	/** Shows a standard notification message. */
	readonly ShowNotification: (
		Notification: INotification,
	) => Effect.Effect<void, HostServiceProblem>;
	/** Shows a notification prompt with choices. */
	readonly ShowPrompt: (
		Severity: Severity,
		Message: string,
		Choices: IPromptChoice[],
		Options?: IPromptOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	/** Shows a message in the status bar. */
	readonly ShowStatusMessage: (
		Message: NotificationMessage,
		Options?: IStatusMessageOptions,
	) => Effect.Effect<void, HostServiceProblem>;
}

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

		const Log = (Level: LogLevel, Message: string) =>
			Integration.Emit("sky://log", { Level, Message }).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "LogForwardingFailed",
						}),
				),
			);

		const ShowNotification = (Notification: INotification) =>
			Integration.Invoke<void>("UserInterface.ShowNotification", {
				Notification,
			}).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowNotificationFailed",
						}),
				),
			);

		const ShowPrompt = (
			Severity: Severity,
			Message: string,
			Choices: IPromptChoice[],
			Options?: IPromptOptions,
		) =>
			Integration.Invoke<void>("UserInterface.ShowPrompt", {
				Severity,
				Message,
				Choices,
				Options,
			}).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowPromptFailed",
						}),
				),
			);

		const ShowStatusMessage = (
			Message: NotificationMessage,
			Options?: IStatusMessageOptions,
		) =>
			Integration.Invoke<void>("UserInterface.ShowStatusMessage", {
				Message: Message.toString(), // Ensure message is a string for IPC
				Options,
			}).pipe(
				Effect.mapError(
					(Cause) =>
						new HostServiceProblem({
							Cause,
							Context: "ShowStatusMessageFailed",
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
			Log,
			ShowNotification,
			ShowPrompt,
			ShowStatusMessage,
		};
	}),
}) {}
