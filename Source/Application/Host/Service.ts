/**
 * @module Service (Application/Host)
 * @description Defines the service interface and live implementation for the HostService.
 * This service is the primary bridge between the webview UI and the native host,
 * responsible for providing essential shims and proxying native UI calls.
 */

import { Effect, Option } from "effect";
import { Emitter, type Event } from "vs/base/common/event.js";
import type { IMarkdownString } from "vs/base/common/htmlContent.js";
import type {
	IProcess,
	ISandboxConfiguration,
} from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes.js";
import type {
	INativeOpenDialogOptions,
	INativeSaveDialogOptions,
	ISaveDialogResult,
} from "vs/platform/dialogs/common/dialogs.js";
import type { IResolvedTextEditorOptions } from "vs/platform/editor/common/editor.js";
import type { LogLevel } from "vs/platform/log/common/log.js";
import type {
	AccessibilityInformation,
	Command,
	FileStat,
	FileType,
	IFileDeleteOptions,
	IFileOverwriteOptions,
	IFileWriteOptions,
	INotification,
	IPromptChoice,
	IPromptOptions,
	IStatusMessageOptions,
	NotificationMessage,
	Severity,
	ThemeColor,
	WebviewOptions,
} from "vscode";

import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { URI, type UriComponents } from "../../Platform/VSCode/Type.js";
import { HostServiceProblem } from "./Error.js";

// --- DTO Interfaces (for IPC between Wind and Mountain) ---

/** Data Transfer Object for a `vscode.StatusBarItem`. */
interface StatusBarEntryDTO {
	readonly id: string;
	readonly name: string | undefined;
	readonly text: string;
	readonly tooltip: string | IMarkdownString | undefined;
	readonly command: Command | undefined;
	readonly priority: number | undefined;
	readonly alignment: number; // 0 for Left, 1 for Right
	readonly backgroundColor: string | undefined;
	readonly color: string | undefined;
	readonly accessibilityInformation: AccessibilityInformation | undefined;
}

/** Data Transfer Object for `vscode.WebviewPanel` show options. */
interface ShowOptionsDTO {
	readonly viewColumn?: number;
	readonly preserveFocus: boolean;
}

/** Data Transfer Object for a `vscode.ThemeIcon` or URI-based icon path. */
interface IconPathDTO {
	readonly light?: UriComponents;
	readonly dark?: UriComponents;
}

/**
 * A factory function that creates a shim for the `ipcRenderer` object,
 * adapting its methods to use the `IntegrationService`.
 * @param Integration The `IntegrationService` instance.
 * @returns An object that shims the `IpcRenderer` interface.
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
		Effect.runFork(Integration.Listen(Channel, Listener as any)),
	send: (Channel, ...Arguments: any[]) =>
		Effect.runFork(Integration.Emit(Channel, Arguments)),
});

/**
 * A factory function that creates a shim for the `process` object using
 * static configuration data fetched from the host.
 * @param Configuration The sandbox configuration from the host.
 * @returns An object that shims the `IProcess` interface.
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
 * The contract for the HostService, defining all methods that bridge to the native host.
 */
export interface Host {
	readonly Configuration: ISandboxConfiguration;
	readonly ProvideGlobals: () => Effect.Effect<void, HostServiceProblem>;
	readonly NotifyReady: () => Effect.Effect<void, HostServiceProblem>;
	readonly Logger: (
		Level: LogLevel,
		Message: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly OnDidChangeWindowState: Event<boolean>;
	readonly ShowTextDocument: (
		Uri: URI,
		ViewColumn: number | undefined,
		Options: IResolvedTextEditorOptions,
	) => Effect.Effect<string, HostServiceProblem>;
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
	readonly Stat: (Uri: URI) => Effect.Effect<FileStat, HostServiceProblem>;
	readonly ReadDirectory: (
		Uri: URI,
	) => Effect.Effect<[string, FileType][], HostServiceProblem>;
	readonly CreateDirectory: (
		Uri: URI,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly ReadFile: (
		Uri: URI,
	) => Effect.Effect<Uint8Array, HostServiceProblem>;
	readonly WriteFile: (
		Uri: URI,
		Content: Uint8Array,
		Options: IFileWriteOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly Delete: (
		Uri: URI,
		Options: IFileDeleteOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly Rename: (
		Source: URI,
		Target: URI,
		Options: IFileOverwriteOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly Copy: (
		Source: URI,
		Target: URI,
		Options: IFileOverwriteOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly ShowNotification: (
		Notification: INotification,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly ShowPrompt: (
		Severity: Severity,
		Message: string,
		Choices: IPromptChoice[],
		Options?: IPromptOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly ShowStatusMessage: (
		Message: NotificationMessage,
		Options?: IStatusMessageOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly SetStatusBarItem: (
		DTO: StatusBarEntryDTO,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly DisposeStatusBarItem: (
		EntryId: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly SetStatusBarMessage: (
		Id: string,
		Message: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly DisposeStatusBarMessage: (
		Id: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly SetWebviewHtml: (
		Handle: string,
		Html: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly SetWebviewOptions: (
		Handle: string,
		Options: WebviewOptions,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly PostMessageToWebview: (
		Handle: string,
		Message: any,
	) => Effect.Effect<boolean, HostServiceProblem>;
	readonly SetWebviewTitle: (
		Handle: string,
		Title: string,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly SetWebviewIconPath: (
		Handle: string,
		IconPath: IconPathDTO | undefined,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly RevealWebviewPanel: (
		Handle: string,
		ShowOptions: ShowOptionsDTO,
	) => Effect.Effect<void, HostServiceProblem>;
	readonly DisposeWebview: (
		Handle: string,
	) => Effect.Effect<void, HostServiceProblem>;
}

/**
 * The `Effect.Service` for the Host service.
 */
export class HostService extends Effect.Service<Host>()("wind/HostService", {
	effect: Effect.gen(function* (Generator) {
		const Integration = yield* Generator(IntegrationService);

		/** A factory for creating proxied effects that call the integration layer. */
		const CreateProxyEffect = <T, Args extends any[]>(
			Method: string,
			Context: string,
		) => {
			return (...Arguments: Args): Effect.Effect<T, HostServiceProblem> =>
				(
					Integration.Invoke<T>(
						Method,
						...Arguments,
					) as Effect.Effect<T, Error>
				).pipe(
					Effect.mapError(
						(Cause) => new HostServiceProblem({ Cause, Context }),
					),
				);
		};

		const Configuration = yield* Generator(
			CreateProxyEffect<ISandboxConfiguration, []>(
				"MountainGetWorkbenchConfiguration",
				"FailedToFetchInitialConfiguration",
			)(),
		);

		const OnDidChangeWindowStateEmitter = new Emitter<boolean>();
		Integration.Listen<boolean>(
			"sky://window/did-change-focus",
			(Event: TauriEvent<boolean>) => {
				if (Event.payload !== undefined) {
					OnDidChangeWindowStateEmitter.fire(Event.payload);
				}
			},
		);

		return {
			Configuration,
			ProvideGlobals: () =>
				Effect.sync(() => {
					(window as any).vscode = {
						ipcRenderer: CreateIpcRendererShim(Integration),
						process: CreateProcessShim(Configuration),
					};
				}),
			NotifyReady: () =>
				Integration.Emit("sky://lifecycle/ready").pipe(
					Effect.mapError(
						(Cause) =>
							new HostServiceProblem({
								Cause,
								Context: "FailedToNotifyHostReady",
							}),
					),
				),
			Logger: CreateProxyEffect<void, [LogLevel, string]>(
				"sky://log",
				"LogForwardingFailed",
			),
			OnDidChangeWindowState: OnDidChangeWindowStateEmitter.event,
			ShowTextDocument: CreateProxyEffect<
				string,
				[URI, number | undefined, IResolvedTextEditorOptions]
			>("WorkSpace.ShowTextDocument", "ShowTextDocumentFailed"),
			ShowOpenDialog: CreateProxyEffect<
				Option.Option<readonly URI[]>,
				[INativeOpenDialogOptions]
			>("UserInterface.ShowOpenDialog", "ShowOpenDialogFailed"),
			ShowSaveDialog: CreateProxyEffect<
				Option.Option<URI>,
				[INativeSaveDialogOptions]
			>("UserInterface.ShowSaveDialog", "ShowSaveDialogFailed"),
			ShowSaveConfirm: CreateProxyEffect<
				ISaveDialogResult,
				[UriComponents[]]
			>("UserInterface.ShowSaveConfirm", "ShowSaveConfirmFailed"),
			OpenFile: CreateProxyEffect<void, [URI]>(
				"WorkSpace.OpenFile",
				"OpenFileFailed",
			),
			Stat: CreateProxyEffect<FileStat, [URI]>(
				"FileSystem.Stat",
				"StatFailed",
			),
			ReadDirectory: CreateProxyEffect<[string, FileType][], [URI]>(
				"FileSystem.ReadDirectory",
				"ReadDirectoryFailed",
			),
			CreateDirectory: CreateProxyEffect<void, [URI]>(
				"FileSystem.CreateDirectory",
				"CreateDirectoryFailed",
			),
			ReadFile: CreateProxyEffect<Uint8Array, [URI]>(
				"FileSystem.ReadFile",
				"ReadFileFailed",
			),
			WriteFile: CreateProxyEffect<
				void,
				[URI, Uint8Array, IFileWriteOptions]
			>("FileSystem.WriteFile", "WriteFileFailed"),
			Delete: CreateProxyEffect<void, [URI, IFileDeleteOptions]>(
				"FileSystem.Delete",
				"DeleteFailed",
			),
			Rename: CreateProxyEffect<void, [URI, URI, IFileOverwriteOptions]>(
				"FileSystem.Rename",
				"RenameFailed",
			),
			Copy: CreateProxyEffect<void, [URI, URI, IFileOverwriteOptions]>(
				"FileSystem.Copy",
				"CopyFailed",
			),
			ShowNotification: CreateProxyEffect<void, [INotification]>(
				"UserInterface.ShowNotification",
				"ShowNotificationFailed",
			),
			ShowPrompt: CreateProxyEffect<
				void,
				[Severity, string, IPromptChoice[], IPromptOptions | undefined]
			>("UserInterface.ShowPrompt", "ShowPromptFailed"),
			ShowStatusMessage: CreateProxyEffect<
				void,
				[NotificationMessage, IStatusMessageOptions | undefined]
			>("UserInterface.ShowStatusMessage", "ShowStatusMessageFailed"),
			SetStatusBarItem: CreateProxyEffect<void, [StatusBarEntryDTO]>(
				"UserInterface.SetStatusBarItem",
				"SetStatusBarItemFailed",
			),
			DisposeStatusBarItem: CreateProxyEffect<void, [string]>(
				"UserInterface.DisposeStatusBarItem",
				"DisposeStatusBarItemFailed",
			),
			SetStatusBarMessage: CreateProxyEffect<void, [string, string]>(
				"UserInterface.SetStatusBarMessage",
				"SetStatusBarMessageFailed",
			),
			DisposeStatusBarMessage: CreateProxyEffect<void, [string]>(
				"UserInterface.DisposeStatusBarMessage",
				"DisposeStatusBarMessageFailed",
			),
			SetWebviewHtml: CreateProxyEffect<void, [string, string]>(
				"WebView.SetHtml",
				"SetWebviewHtmlFailed",
			),
			SetWebviewOptions: CreateProxyEffect<
				void,
				[string, WebviewOptions]
			>("WebView.SetOptions", "SetWebviewOptionsFailed"),
			PostMessageToWebview: CreateProxyEffect<boolean, [string, any]>(
				"WebView.PostMessage",
				"PostMessageToWebviewFailed",
			),
			SetWebviewTitle: CreateProxyEffect<void, [string, string]>(
				"WebView.SetTitle",
				"SetWebviewTitleFailed",
			),
			SetWebviewIconPath: CreateProxyEffect<
				void,
				[string, IconPathDTO | undefined]
			>("WebView.SetIconPath", "SetWebviewIconPathFailed"),
			RevealWebviewPanel: CreateProxyEffect<
				void,
				[string, ShowOptionsDTO]
			>("WebView.Reveal", "RevealWebviewPanelFailed"),
			DisposeWebview: CreateProxyEffect<void, [string]>(
				"WebView.Dispose",
				"DisposeWebviewFailed",
			),
		};
	}),
}) {}
