/**
 * @module Type (Platform/VSCode)
 * @description Provides concrete implementations and re-exports of core `vscode` API
 * types, such as `URI`, `Range`, `Position`, and `Disposable`.
 *
 * This file serves as the single source of truth for these foundational types
 * throughout the entire Wind application. By ensuring all modules import from
 * this file, we guarantee type consistency and isolate direct dependencies on
 * the `vs/` and `vscode` modules to one location.
 */
import { CancellationTokenSource as VSCodeCancellationTokenSource } from "vs/base/common/cancellation.js";
import { CancellationError as VSCodeCancellationError } from "vs/base/common/errors.js";
import { Emitter } from "vs/base/common/event.js";
import { URI as VSCodeURI } from "vs/base/common/uri.js";
import { FileType as VSCodeFileType } from "vs/platform/files/common/files.js";
import type * as VSCode from "vscode";
import { CompletionItemKind, CompletionItemTag, ConfigurationTarget, DiagnosticSeverity, DiagnosticTag, EndOfLine, ProgressLocation, QuickPickItemKind, SnippetString, StatusBarAlignment, TextEditorCursorStyle, TreeItemCollapsibleState, ViewColumn } from "vscode";
export { CompletionItemKind, CompletionItemTag, ConfigurationTarget, DiagnosticSeverity, DiagnosticTag, EndOfLine, ProgressLocation, QuickPickItemKind, SnippetString, StatusBarAlignment, TextEditorCursorStyle, TreeItemCollapsibleState, ViewColumn, };
/**
 * The canonical `Disposable` class used throughout the application.
 */
export declare class Disposable implements VSCode.Disposable {
    private OnDisposeCallback;
    constructor(OnDisposeCallback: () => any);
    dispose(): any;
    [Symbol.dispose](): void;
}
/** The canonical `CancellationTokenSource` class. */
export declare const CancellationTokenSource: typeof VSCodeCancellationTokenSource;
/** The canonical `CancellationError` class. */
export declare const CancellationError: typeof VSCodeCancellationError;
/** The canonical `EventEmitter` class. */
export declare const EventEmitter: typeof Emitter;
/** The canonical `URI` class. */
export declare const URI: typeof VSCodeURI;
export type Uri = VSCodeURI;
/** The canonical `ThemeIcon` class. */
export declare const ThemeIcon: typeof VSCode.ThemeIcon;
/** The canonical `ProcessExecution` class for Tasks. */
export declare const ProcessExecution: typeof VSCode.ProcessExecution;
/** The canonical `Task` class. */
export declare const Task: typeof VSCode.Task;
/** The canonical `WorkspaceEdit` class. */
export declare const WorkspaceEdit: typeof VSCode.WorkspaceEdit;
/** The canonical `TextEdit` class. */
export declare const TextEdit: typeof VSCode.TextEdit;
/** The canonical `FileType` enum. */
export declare const FileType: typeof VSCodeFileType;
/**
 * The canonical `Position` class, representing a line and character.
 */
export declare class Position implements VSCode.Position {
    readonly line: number;
    readonly character: number;
    constructor(line: number, character: number);
    isBefore(other: VSCode.Position): boolean;
    isBeforeOrEqual(other: VSCode.Position): boolean;
    isAfter(other: VSCode.Position): boolean;
    isAfterOrEqual(other: VSCode.Position): boolean;
    isEqual(other: VSCode.Position): boolean;
    compareTo(other: VSCode.Position): number;
    translate(lineDelta?: number, characterDelta?: number): Position;
    translate(change: {
        lineDelta?: number;
        characterDelta?: number;
    }): Position;
    with(line?: number, character?: number): Position;
    with(change: {
        line?: number;
        character?: number;
    }): Position;
    toJSON(): any;
}
/**
 * The canonical `Range` class, representing a start and end position.
 */
export declare class Range implements VSCode.Range {
    readonly start: Position;
    readonly end: Position;
    constructor(start: Position, end: Position);
    constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number);
}
/**
 * The canonical `Selection` class, representing a range with an active cursor position.
 */
export declare class Selection extends Range implements VSCode.Selection {
    readonly anchor: Position;
    readonly active: Position;
    constructor(anchor: Position, active: Position);
    constructor(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number);
}
