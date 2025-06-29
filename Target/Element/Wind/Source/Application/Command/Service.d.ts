/**
 * @module Service (Application/Command)
 * @description Defines the service for managing and executing commands,
 * implementing the core logic of `vscode.commands`.
 */
import { Effect } from "effect";
import type { IDisposable } from "vs/base/common/lifecycle.js";
import type { TextEditor, TextEditorEdit } from "vscode";
/**
 * Represents the internal structure of a registered command.
 */
export interface InternalCommand {
    readonly Id: string;
    readonly Callback: (...Arguments: any[]) => any;
    readonly ThisArgument: any;
}
/**
 * The contract for the Command service, mirroring the public `vscode.commands` API.
 */
export interface Command {
    readonly registerCommand: (Global: boolean, Id: string, Callback: <T>(...Arguments: any[]) => T | Promise<T>, ThisArgument?: any) => IDisposable;
    readonly registerTextEditorCommand: (Id: string, Callback: (TextEditor: TextEditor, Edit: TextEditorEdit, ...Arguments: any[]) => void, ThisArgument?: any) => IDisposable;
    readonly executeCommand: <T>(Id: string, ...Arguments: any[]) => Promise<T | undefined>;
    readonly getCommands: (FilterInternal?: boolean) => Promise<string[]>;
}
declare const CommandService_base: Effect.Service.Class<Command, "Service/Command", {
    readonly effect: Effect.Effect<Command, never, import("vs/platform/log/common/log.js").ILoggerService | import("../IPC/Service.js").IPC | import("../Window/Service.js").Window>;
}>;
/**
 * The `Effect.Service` for the Command service.
 */
export declare class CommandService extends CommandService_base {
}
export {};
