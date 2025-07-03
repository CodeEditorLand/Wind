/**
 * @module Service (Application/Host)
 * @description Defines the service interface and live implementation for the HostService.
 * This service is the primary bridge between the webview UI and the native host,
 * responsible for providing essential shims and proxying native UI calls.
 */
import { Effect, Option } from "effect";
import { type Event } from "@codeeditorland/output/vs/base/common/event.js";
import type { IMarkdownString } from "@codeeditorland/output/vs/base/common/htmlContent.js";
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes.js";
import type { INativeOpenDialogOptions } from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import type { IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions } from "@codeeditorland/output/vs/platform/files/common/files.js";
import type { LogLevel } from "@codeeditorland/output/vs/platform/log/common/log.js";
import type { INotification, IPromptChoice, IPromptOptions, IStatusMessageOptions, NotificationMessage, Severity } from "@codeeditorland/output/vs/platform/notification/common/notification.js";
import type { URI } from "@codeeditorland/output/vs/workbench/workbench.web.main.internal.js";
import type { AccessibilityInformation, Command, FileStat, FileType, WebviewOptions } from "vscode";
import { type Uri, type UriComponents } from "../../Platform/VSCode/Type.js";
import { HostServiceProblem } from "./Error.js";
/** Data Transfer Object for a `vscode.StatusBarItem`. */
interface StatusBarEntryDTO {
    readonly id: string;
    readonly name: string | undefined;
    readonly text: string;
    readonly tooltip: string | IMarkdownString | undefined;
    readonly command: Command | undefined;
    readonly priority: number | undefined;
    readonly alignment: number;
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
 * The contract for the HostService, defining all methods that bridge to the native host.
 */
export interface Host {
    readonly Configuration: ISandboxConfiguration;
    readonly ProvideGlobals: () => Effect.Effect<void, HostServiceProblem>;
    readonly NotifyReady: () => Effect.Effect<void, HostServiceProblem>;
    readonly Logger: (Level: LogLevel, Message: string) => Effect.Effect<void, HostServiceProblem>;
    readonly OnDidChangeWindowState: Event<boolean>;
    readonly ShowTextDocument: (Uri: URI, ViewColumn: number | undefined, Options: IResolvedTextEditorOptions) => Effect.Effect<string, HostServiceProblem>;
    readonly ShowOpenDialog: (Options: INativeOpenDialogOptions) => Effect.Effect<Option.Option<readonly Uri[]>, HostServiceProblem>;
    readonly ShowSaveDialog: (Options: INativeSaveDialogOptions) => Effect.Effect<Option.Option<Uri>, HostServiceProblem>;
    readonly ShowSaveConfirm: (Files: UriComponents[]) => Effect.Effect<ISaveDialogResult, HostServiceProblem>;
    readonly OpenFile: (Uri: Uri) => Effect.Effect<void, HostServiceProblem>;
    readonly Stat: (Uri: Uri) => Effect.Effect<FileStat, HostServiceProblem>;
    readonly ReadDirectory: (Uri: Uri) => Effect.Effect<[string, FileType][], HostServiceProblem>;
    readonly CreateDirectory: (Uri: Uri) => Effect.Effect<void, HostServiceProblem>;
    readonly ReadFile: (Uri: Uri) => Effect.Effect<Uint8Array, HostServiceProblem>;
    readonly WriteFile: (Uri: Uri, Content: Uint8Array, Options: IFileWriteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Delete: (Uri: Uri, Options: IFileDeleteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Rename: (Source: Uri, Target: Uri, Options: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Copy: (Source: Uri, Target: Uri, Options: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly ShowNotification: (Notification: INotification) => Effect.Effect<void, HostServiceProblem>;
    readonly ShowPrompt: (Severity: Severity, Message: string, Choices: IPromptChoice[], Options?: IPromptOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly ShowStatusMessage: (Message: NotificationMessage, Options?: IStatusMessageOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly SetStatusBarItem: (DTO: StatusBarEntryDTO) => Effect.Effect<void, HostServiceProblem>;
    readonly DisposeStatusBarItem: (EntryId: string) => Effect.Effect<void, HostServiceProblem>;
    readonly SetStatusBarMessage: (Id: string, Message: string) => Effect.Effect<void, HostServiceProblem>;
    readonly DisposeStatusBarMessage: (Id: string) => Effect.Effect<void, HostServiceProblem>;
    readonly SetWebviewHtml: (Handle: string, Html: string) => Effect.Effect<void, HostServiceProblem>;
    readonly SetWebviewOptions: (Handle: string, Options: WebviewOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly PostMessageToWebview: (Handle: string, Message: any) => Effect.Effect<boolean, HostServiceProblem>;
    readonly SetWebviewTitle: (Handle: string, Title: string) => Effect.Effect<void, HostServiceProblem>;
    readonly SetWebviewIconPath: (Handle: string, IconPath: IconPathDTO | undefined) => Effect.Effect<void, HostServiceProblem>;
    readonly RevealWebviewPanel: (Handle: string, ShowOptions: ShowOptionsDTO) => Effect.Effect<void, HostServiceProblem>;
    readonly DisposeWebview: (Handle: string) => Effect.Effect<void, HostServiceProblem>;
}
declare const HostService_base: Effect.Service.Class<Host, "wind/HostService", {
    readonly effect: Effect.Effect<{
        Configuration: ISandboxConfiguration;
        ProvideGlobals: () => Effect.Effect<void, never, never>;
        NotifyReady: () => Effect.Effect<void, HostServiceProblem, never>;
        Logger: (Arguments_0: LogLevel, Arguments_1: string) => Effect.Effect<void, HostServiceProblem, never>;
        OnDidChangeWindowState: Event<boolean>;
        ShowTextDocument: (Arguments_0: URI, Arguments_1: number | undefined, Arguments_2: IResolvedTextEditorOptions) => Effect.Effect<string, HostServiceProblem, never>;
        ShowOpenDialog: (Arguments_0: INativeOpenDialogOptions) => Effect.Effect<Option.Option<readonly URI[]>, HostServiceProblem, never>;
        ShowSaveDialog: (Arguments_0: INativeSaveDialogOptions) => Effect.Effect<Option.Option<URI>, HostServiceProblem, never>;
        ShowSaveConfirm: (Arguments_0: import("@codeeditorland/output/vs/base/common/uri.js").UriComponents[]) => Effect.Effect<ISaveDialogResult, HostServiceProblem, never>;
        OpenFile: (Arguments_0: URI) => Effect.Effect<void, HostServiceProblem, never>;
        Stat: (Arguments_0: URI) => Effect.Effect<FileStat, HostServiceProblem, never>;
        ReadDirectory: (Arguments_0: URI) => Effect.Effect<[string, FileType][], HostServiceProblem, never>;
        CreateDirectory: (Arguments_0: URI) => Effect.Effect<void, HostServiceProblem, never>;
        ReadFile: (Arguments_0: URI) => Effect.Effect<Uint8Array<ArrayBufferLike>, HostServiceProblem, never>;
        WriteFile: (Arguments_0: URI, Arguments_1: Uint8Array<ArrayBufferLike>, Arguments_2: IFileWriteOptions) => Effect.Effect<void, HostServiceProblem, never>;
        Delete: (Arguments_0: URI, Arguments_1: IFileDeleteOptions) => Effect.Effect<void, HostServiceProblem, never>;
        Rename: (Arguments_0: URI, Arguments_1: URI, Arguments_2: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem, never>;
        Copy: (Arguments_0: URI, Arguments_1: URI, Arguments_2: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem, never>;
        ShowNotification: (Arguments_0: INotification) => Effect.Effect<void, HostServiceProblem, never>;
        ShowPrompt: (Arguments_0: Severity, Arguments_1: string, Arguments_2: IPromptChoice[], Arguments_3: IPromptOptions | undefined) => Effect.Effect<void, HostServiceProblem, never>;
        ShowStatusMessage: (Arguments_0: NotificationMessage, Arguments_1: IStatusMessageOptions | undefined) => Effect.Effect<void, HostServiceProblem, never>;
        SetStatusBarItem: (Arguments_0: StatusBarEntryDTO) => Effect.Effect<void, HostServiceProblem, never>;
        DisposeStatusBarItem: (Arguments_0: string) => Effect.Effect<void, HostServiceProblem, never>;
        SetStatusBarMessage: (Arguments_0: string, Arguments_1: string) => Effect.Effect<void, HostServiceProblem, never>;
        DisposeStatusBarMessage: (Arguments_0: string) => Effect.Effect<void, HostServiceProblem, never>;
        SetWebviewHtml: (Arguments_0: string, Arguments_1: string) => Effect.Effect<void, HostServiceProblem, never>;
        SetWebviewOptions: (Arguments_0: string, Arguments_1: WebviewOptions) => Effect.Effect<void, HostServiceProblem, never>;
        PostMessageToWebview: (Arguments_0: string, Arguments_1: any) => Effect.Effect<boolean, HostServiceProblem, never>;
        SetWebviewTitle: (Arguments_0: string, Arguments_1: string) => Effect.Effect<void, HostServiceProblem, never>;
        SetWebviewIconPath: (Arguments_0: string, Arguments_1: IconPathDTO | undefined) => Effect.Effect<void, HostServiceProblem, never>;
        RevealWebviewPanel: (Arguments_0: string, Arguments_1: ShowOptionsDTO) => Effect.Effect<void, HostServiceProblem, never>;
        DisposeWebview: (Arguments_0: string) => Effect.Effect<void, HostServiceProblem, never>;
    }, Error, import("../../Integration/Tauri/Service.js").Integration>;
}>;
/**
 * The `Effect.Service` for the Host service.
 */
export declare class HostService extends HostService_base {
}
export {};
//# sourceMappingURL=Service.d.ts.map