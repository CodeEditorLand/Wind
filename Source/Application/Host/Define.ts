/**
 * @module Define
 * @description
 * Defines the service interface and live implementation for the HostService.
 * This service is the primary bridge between the webview UI and the native host,
 * responsible for providing essential shims and proxying native UI calls. It
s an abstraction over the `IntegrationService`, providing a semantic API for
 * host interactions.
 */

import type { IMarkdownString } from "@codeeditorland/output/vs/base/common/htmlContent.js";
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js";
import type { INativeOpenDialogOptions } from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import type {
	IFileDeleteOptions,
	IFileOverwriteOptions,
	IFileWriteOptions,
} from "@codeeditorland/output/vs/platform/files/common/files.js";
import type { LogLevel } from "@codeeditorland/output/vs/platform/log/common/log.js";
import type {
	INotification,
	IPromptChoice,
	IPromptOptions,
	IStatusMessageOptions,
	NotificationMessage,
	Severity,
} from "@codeeditorland/output/vs/platform/notification/common/notification.js";
import { Effect, Option } from "effect";
import type {
	AccessibilityInformation,
	Command,
	FileStat,
	FileType,
	WebviewOptions,
} from "vscode";

import { CreateEmitter, type Event } from "../../Platform/VSCode/Type.js";
import { IntegrationService } from "../Integration/Define.js";
import type { IntegrationProblem } from "../Integration/Problem.js";
import { HostProblem } from "./Problem.js";

// Re-exporting local DTOs for clarity and encapsulation. These are the data
// structures used for IPC between the Wind frontend and the Mountain backend.

/**
 * Data Transfer Object for a `vscode.StatusBarItem`.
 */
export interface StatusBarEntryDTO {
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

/**
 * Data Transfer Object for `vscode.WebviewPanel` show options.
 */
export interface ShowOptionsDTO {
	readonly viewColumn?: number;
	readonly preserveFocus: boolean;
}

/**
 * Data Transfer Object for a `vscode.ThemeIcon` or URI-based icon path.
 */
export interface IconPathDTO {
	readonly light?: UriDTO;
	readonly dark?: UriDTO;
}

/**
 * The contract for the HostService, defining all methods that bridge
 * the application to the native host (`Mountain`).
 */
export interface Interface {
	/**
	 * The initial sandbox configuration fetched from the host, required to
	 * bootstrap the VS Code workbench.
	 */
	readonly Configuration: ISandboxConfiguration;

	/**
	 * An `Effect` that must be run at startup to provide essential shims
	 * (like `window.vscode.ipcRenderer`) that the workbench code expects.
	 */
	readonly ProvideGlobals: () => Effect.Effect<void, never>;

	/**
	 * An `Effect` to be run when the workbench UI is fully loaded and
	 * operational, signaling readiness to the native host.
	 */
	readonly NotifyReady: () => Effect.Effect<void, HostProblem>;

	/**
	 * Forwards a log message to the native host for centralized logging.
	 * @param Level The severity level of the log message.
	 * @param Message The log message content.
	 */
	readonly Log: (
		Level: LogLevel,
		Message: string,
	) => Effect.Effect<void, HostProblem>;

	/**
	 * An event that fires when the window's focus state changes.
	 */
	readonly OnDidChangeWindowState: Event<boolean>;

	// --- File System Operations ---
	readonly Stat: (URI: Uri) => Effect.Effect<FileStat, HostProblem>;
	readonly ReadDirectory: (
		URI: Uri,
	) => Effect.Effect<[string, FileType][], HostProblem>;
	readonly CreateDirectory: (URI: Uri) => Effect.Effect<void, HostProblem>;
	readonly ReadFile: (URI: Uri) => Effect.Effect<Uint8Array, HostProblem>;
	readonly WriteFile: (
		URI: Uri,
		Content: Uint8Array,
		Options: IFileWriteOptions,
	) => Effect.Effect<void, HostProblem>;
	readonly Delete: (
		URI: Uri,
		Options: IFileDeleteOptions,
	) => Effect.Effect<void, HostProblem>;
	readonly Rename: (
		Source: Uri,
		Target: Uri,
		Options: IFileOverwriteOptions,
	) => Effect.Effect<void, HostProblem>;
	readonly Copy: (
		Source: Uri,
		Target: Uri,
		Options: IFileOverwriteOptions,
	) => Effect.Effect<void, HostProblem>;

	// --- Workspace & Editor Operations ---
	readonly OpenFile: (URI: Uri) => Effect.Effect<void, HostProblem>;

	// --- User Interface Operations ---
	readonly ShowOpenDialog: (
		Options: INativeOpenDialogOptions,
	) => Effect.Effect<Option.Option<readonly Uri[]>, HostProblem>;
	readonly ShowSaveDialog: (
		Options: any, // INativeSaveDialogOptions
	) => Effect.Effect<Option.Option<Uri>, HostProblem>;
	readonly ShowNotification: (
		Notification: INotification,
	) => Effect.Effect<void, HostProblem>;
	readonly ShowPrompt: (
		Severity: Severity,
		Message: string,
		Choices: IPromptChoice[],
		Options?: IPromptOptions,
	) => Effect.Effect<void, HostProblem>;

	// --- Status Bar ---
	readonly SetStatusBarItem: (
		DTO: StatusBarEntryDTO,
	) => Effect.Effect<void, HostProblem>;
	readonly DisposeStatusBarItem: (
		EntryID: string,
	) => Effect.Effect<void, HostProblem>;

	// --- Webview ---
	readonly SetWebviewHtml: (
		Handle: string,
		Html: string,
	) => Effect.Effect<void, HostProblem>;
	readonly SetWebviewOptions: (
		Handle: string,
		Options: WebviewOptions,
	) => Effect.Effect<void, HostProblem>;
	readonly PostMessageToWebview: (
		Handle: string,
		Message: any,
	) => Effect.Effect<boolean, HostProblem>;
	readonly SetWebviewTitle: (
		Handle: string,
		Title: string,
	) => Effect.Effect<void, HostProblem>;
	readonly SetWebviewIconPath: (
		Handle: string,
		IconPath: IconPathDTO | undefined,
	) => Effect.Effect<void, HostProblem>;
	readonly RevealWebviewPanel: (
		Handle: string,
		ShowOptions: ShowOptionsDTO,
	) => Effect.Effect<void, HostProblem>;
	readonly DisposeWebview: (
		Handle: string,
	) => Effect.Effect<void, HostProblem>;
}

/**
 * The `Effect.Service` for the `HostService`. It provides the live implementation
 * that proxies all calls to the `IntegrationService`.
 */
export class HostService extends Effect.Service<Interface>()("Service/Host", {
	effect: Effect.gen(function* (Generator) {
		const Integration = yield* Generator(IntegrationService);

		/**
		 * A factory for creating proxied effects that call the integration layer.
		 * This abstracts the pattern of invoking a command and mapping the error.
		 */
		const CreateProxy = <T, Arguments extends any[]>(
			Method: string,
			Context: string,
		) => {
			return (...Arguments: Arguments): Effect.Effect<T, HostProblem> =>
				Integration.Invoke<T>(Method, { ...Arguments }).pipe(
					Effect.mapError(
						(Cause: IntegrationProblem) =>
							new HostProblem({ Cause, Context }),
					),
				);
		};

		// Fetch the essential startup configuration from the host. This is a
		// blocking call within the service's constructor effect, ensuring that
		// the configuration is available before the service can be used.
		const Configuration = yield* Generator(
			CreateProxy<ISandboxConfiguration, []>(
				"MountainGetWorkbenchConfiguration",
				"FailedToFetchInitialConfiguration",
			)(),
		);

		const { event: OnDidChangeWindowState, fire: FireWindowState } =
			yield* Generator(CreateEmitter<boolean>());

		// Fork a daemon to listen for window state changes from the host.
		yield* Generator(
			Effect.forkDaemon(
				Integration.Listen<boolean>(
					"sky://window/did-change-focus",
					(Event) => {
						if (Event.payload !== undefined) {
							FireWindowState(Event.payload);
						}
					},
				),
			),
		);

		// Return the full implementation of the `Host` interface.
		return {
			Configuration,
			ProvideGlobals: () =>
				Effect.sync(() => {
					// This part of the original code for shimming is complex and
					// better handled by the dedicated `WindHostBridge.ts` script
					// that runs before the main application. This method remains
					// as a placeholder for any higher-level globals that might
					// be needed later.
				}),
			NotifyReady: () =>
				Integration.Emit("sky://lifecycle/ready").pipe(
					Effect.mapError(
						(Cause) =>
							new HostProblem({
								Cause,
								Context: "FailedToNotifyHostReady",
							}),
					),
				),
			Log: CreateProxy<void, [LogLevel, string]>(
				"sky://log",
				"LogForwardingFailed",
			),
			OnDidChangeWindowState,
			Stat: CreateProxy<FileStat, [Uri]>("FileSystem.Stat", "StatFailed"),
			ReadDirectory: CreateProxy<[string, FileType][], [Uri]>(
				"FileSystem.ReadDirectory",
				"ReadDirectoryFailed",
			),
			CreateDirectory: CreateProxy<void, [Uri]>(
				"FileSystem.CreateDirectory",
				"CreateDirectoryFailed",
			),
			ReadFile: CreateProxy<Uint8Array, [Uri]>(
				"FileSystem.ReadFile",
				"ReadFileFailed",
			),
			WriteFile: CreateProxy<void, [Uri, Uint8Array, IFileWriteOptions]>(
				"FileSystem.WriteFile",
				"WriteFileFailed",
			),
			Delete: CreateProxy<void, [Uri, IFileDeleteOptions]>(
				"FileSystem.Delete",
				"DeleteFailed",
			),
			Rename: CreateProxy<void, [Uri, Uri, IFileOverwriteOptions]>(
				"FileSystem.Rename",
				"RenameFailed",
			),
			Copy: CreateProxy<void, [Uri, Uri, IFileOverwriteOptions]>(
				"FileSystem.Copy",
				"CopyFailed",
			),
			OpenFile: CreateProxy<void, [Uri]>(
				"WorkSpace.OpenFile",
				"OpenFileFailed",
			),
			ShowOpenDialog: CreateProxy<Option.Option<readonly Uri[]>, [any]>(
				"UserInterface.ShowOpenDialog",
				"ShowOpenDialogFailed",
			),
			ShowSaveDialog: CreateProxy<Option.Option<Uri>, [any]>(
				"UserInterface.ShowSaveDialog",
				"ShowSaveDialogFailed",
			),
			ShowNotification: CreateProxy<void, [INotification]>(
				"UserInterface.ShowNotification",
				"ShowNotificationFailed",
			),
			ShowPrompt: CreateProxy<
				void,
				[Severity, string, IPromptChoice[], IPromptOptions | undefined]
			>("UserInterface.ShowPrompt", "ShowPromptFailed"),
			SetStatusBarItem: CreateProxy<void, [StatusBarEntryDTO]>(
				"UserInterface.SetStatusBarItem",
				"SetStatusBarItemFailed",
			),
			DisposeStatusBarItem: CreateProxy<void, [string]>(
				"UserInterface.DisposeStatusBarItem",
				"DisposeStatusBarItemFailed",
			),
			SetWebviewHtml: CreateProxy<void, [string, string]>(
				"WebView.SetHtml",
				"SetWebviewHtmlFailed",
			),
			SetWebviewOptions: CreateProxy<void, [string, WebviewOptions]>(
				"WebView.SetOptions",
				"SetWebviewOptionsFailed",
			),
			PostMessageToWebview: CreateProxy<boolean, [string, any]>(
				"WebView.PostMessage",
				"PostMessageToWebviewFailed",
			),
			SetWebviewTitle: CreateProxy<void, [string, string]>(
				"WebView.SetTitle",
				"SetWebviewTitleFailed",
			),
			SetWebviewIconPath: CreateProxy<
				void,
				[string, IconPathDTO | undefined]
			>("WebView.SetIconPath", "SetWebviewIconPathFailed"),
			RevealWebviewPanel: CreateProxy<void, [string, ShowOptionsDTO]>(
				"WebView.Reveal",
				"RevealWebviewPanelFailed",
			),
			DisposeWebview: CreateProxy<void, [string]>(
				"WebView.Dispose",
				"DisposeWebviewFailed",
			),
		};
	}),
}) {}
