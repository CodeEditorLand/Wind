/**
 * @module Service (Application/Host)
 * @description Defines the service interface and live implementation for the HostService.
 */
import type { FileStat, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions } from "vscode";
import { Effect, Option } from "effect";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes.js";
import type { INativeOpenDialogOptions, INativeSaveDialogOptions, ISaveDialogResult } from "vs/platform/dialogs/common/dialogs.js";
import type { LogLevel } from "vs/platform/log/common/log.js";
import { type UriComponents } from "Source/Platform/VSCode/Type.js";
import type { INotification, IPromptChoice, IPromptOptions, IStatusMessageOptions, NotificationMessage, Severity } from "vs/platform/notification/common/notification.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { HostServiceProblem } from "./Error.js";
/**
 * The `HostService` is the primary bridge between the Wind application and the
 * native `Mountain` host.
 */
interface Host {
    readonly Configuration: ISandboxConfiguration;
    readonly ProvideGlobals: () => Effect.Effect<void, HostServiceProblem>;
    readonly NotifyReady: () => Effect.Effect<void, HostServiceProblem>;
    readonly ShowOpenDialog: (Options: INativeOpenDialogOptions) => Effect.Effect<Option.Option<readonly URI[]>, HostServiceProblem>;
    readonly ShowSaveDialog: (Options: INativeSaveDialogOptions) => Effect.Effect<Option.Option<URI>, HostServiceProblem>;
    readonly ShowSaveConfirm: (Files: UriComponents[]) => Effect.Effect<ISaveDialogResult, HostServiceProblem>;
    readonly OpenFile: (Uri: URI) => Effect.Effect<void, HostServiceProblem>;
    readonly Log: (Level: LogLevel, Message: string) => Effect.Effect<void, HostServiceProblem>;
    /** Shows a standard notification message. */
    readonly ShowNotification: (Notification: INotification) => Effect.Effect<void, HostServiceProblem>;
    /** Shows a notification prompt with choices. */
    readonly ShowPrompt: (Severity: Severity, Message: string, Choices: IPromptChoice[], Options?: IPromptOptions) => Effect.Effect<void, HostServiceProblem>;
    /** Shows a message in the status bar. */
    readonly ShowStatusMessage: (Message: NotificationMessage, Options?: IStatusMessageOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Stat: (Uri: URI) => Effect.Effect<FileStat, HostServiceProblem>;
    readonly ReadDirectory: (Uri: URI) => Effect.Effect<[string, FileType][], HostServiceProblem>;
    readonly CreateDirectory: (Uri: URI) => Effect.Effect<void, HostServiceProblem>;
    readonly ReadFile: (Uri: URI) => Effect.Effect<Uint8Array, HostServiceProblem>;
    readonly WriteFile: (Uri: URI, Content: Uint8Array, Options: IFileWriteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Delete: (Uri: URI, Options: IFileDeleteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Rename: (Source: URI, Target: URI, Options: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem>;
    readonly Copy: (Source: URI, Target: URI, Options: IFileOverwriteOptions) => Effect.Effect<void, HostServiceProblem>;
}
declare const HostService_base: Effect.Service.Class<Host, "wind/HostService", {
    readonly effect: Effect.Effect<{
        Configuration: never;
        ProvideGlobals: () => Effect.Effect<void, HostServiceProblem, never>;
        NotifyReady: () => Effect.Effect<never, HostServiceProblem, never>;
        ShowOpenDialog: (Options: INativeOpenDialogOptions) => Effect.Effect<Option.Option<any>, HostServiceProblem, never>;
        ShowSaveDialog: (Options: INativeSaveDialogOptions) => Effect.Effect<Option.Option<import("vs/workbench/workbench.web.main.internal.js").URI | null | undefined>, HostServiceProblem, never>;
        ShowSaveConfirm: (Files: UriComponents[]) => Effect.Effect<never, HostServiceProblem, never>;
        OpenFile: (Uri: URI) => Effect.Effect<never, HostServiceProblem, never>;
        Log: (Level: LogLevel, Message: string) => Effect.Effect<never, HostServiceProblem, never>;
        ShowNotification: (Notification: INotification) => Effect.Effect<never, HostServiceProblem, never>;
        ShowPrompt: (Severity: Severity, Message: string, Choices: IPromptChoice[], Options?: IPromptOptions) => Effect.Effect<never, HostServiceProblem, never>;
        ShowStatusMessage: (Message: NotificationMessage, Options?: IStatusMessageOptions) => Effect.Effect<never, HostServiceProblem, never>;
        Stat: (Uri: URI) => Effect.Effect<never, HostServiceProblem, never>;
        ReadDirectory: (Uri: URI) => Effect.Effect<never, HostServiceProblem, never>;
        CreateDirectory: (Uri: URI) => Effect.Effect<never, HostServiceProblem, never>;
        ReadFile: (Uri: URI) => Effect.Effect<never, HostServiceProblem, never>;
        WriteFile: (Uri: URI, Content: Uint8Array, Options: IFileWriteOptions) => Effect.Effect<never, HostServiceProblem, never>;
        Delete: (Uri: URI, Options: IFileDeleteOptions) => Effect.Effect<never, HostServiceProblem, never>;
        Rename: (Source: URI, Target: URI, Options: IFileOverwriteOptions) => Effect.Effect<never, HostServiceProblem, never>;
        Copy: (Source: URI, Target: URI, Options: IFileOverwriteOptions) => Effect.Effect<never, HostServiceProblem, never>;
    }, HostServiceProblem, IntegrationService>;
}>;
export declare class HostService extends HostService_base {
}
export {};
