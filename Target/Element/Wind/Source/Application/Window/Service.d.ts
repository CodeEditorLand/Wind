/**
 * @module Service (Application/Window)
 * @description Defines the service for managing window-level state and orchestrating
 * calls to show documents in the editor, conforming to the `vscode.window` API surface.
 */
import { Effect } from "effect";
import { type Event, type TextDocument, type TextDocumentShowOptions, type TextEditor, type Uri, type ViewColumn, type WindowState } from "vscode";
import { WindowProblem } from "./Error.js";
/**
 * The contract for the Window service, mirroring a subset of the `vscode.window` API.
 */
export interface Window {
    readonly state: WindowState;
    readonly onDidChangeWindowState: Event<WindowState>;
    readonly activeTextEditor: TextEditor | undefined;
    readonly visibleTextEditors: readonly TextEditor[];
    readonly ShowTextDocument: (documentOrUri: Uri | TextDocument, columnOrOptions?: ViewColumn | TextDocumentShowOptions, preserveFocus?: boolean) => Effect.Effect<TextEditor, WindowProblem>;
}
declare const WindowService_base: Effect.Service.Class<Window, "Service/Window", {
    readonly effect: Effect.Effect<{
        readonly state: WindowState;
        onDidChangeWindowState: import("vs/workbench/workbench.web.main.internal.js").Event<WindowState>;
        readonly activeTextEditor: any;
        readonly visibleTextEditors: any;
        ShowTextDocument: (documentOrUri: Uri | TextDocument, columnOrOptions?: ViewColumn | TextDocumentShowOptions, preserveFocus?: boolean) => Effect.Effect<TextEditor, WindowProblem>;
    }, never, unknown>;
}>;
/**
 * The `Effect.Service` for the Window service.
 */
export declare class WindowService extends WindowService_base {
}
export {};
