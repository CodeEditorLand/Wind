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
import { type IMarkdownString as VSCodeIMarkdownString } from "@codeeditorland/output/vs/base/common/htmlContent.js";
import { URI as VSCodeURI, type UriComponents as VSCodeUriComponents } from "@codeeditorland/output/vs/base/common/uri.js";
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
export declare const CancellationTokenSource: any;
/** The canonical `CancellationError` class. */
export declare const CancellationError: any;
/** The canonical `EventEmitter` class. */
export declare const EventEmitter: any;
/** The canonical `URI` class and its associated types. */
export declare const URI: typeof VSCodeURI;
export type Uri = VSCodeURI;
export type UriComponents = VSCodeUriComponents;
/** The canonical `ThemeColor` class. */
export declare const ThemeColor: any;
/** The canonical `ThemeIcon` class. */
export declare const ThemeIcon: any;
/** The canonical `MarkdownString` class. */
export declare const MarkdownString: any;
export type IMarkdownString = VSCodeIMarkdownString;
/** The canonical `ProcessExecution` class for Tasks. */
export declare const ProcessExecution: any;
/** The canonical `Task` class. */
export declare const Task: any;
/** The canonical `WorkspaceEdit` class. */
export declare const WorkspaceEdit: any;
/** The canonical `TextEdit` class. */
export declare const TextEdit: any;
/** The canonical `FileType` enum. */
export declare const FileType: any;
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
    get isEmpty(): boolean;
    get isSingleLine(): boolean;
    contains(positionOrRange: Position | Range): boolean;
    isEqual(other: Range): boolean;
    intersection(other: Range): Range | undefined;
    union(other: Range): Range;
    with(start?: Position, end?: Position): Range;
    with(change: {
        start?: Position;
        end?: Position;
    }): Range;
    toJSON(): any;
}
/**
 * The canonical `Selection` class, representing a range with an active cursor position.
 */
export declare class Selection extends Range implements VSCode.Selection {
    readonly anchor: Position;
    readonly active: Position;
    constructor(anchor: Position, active: Position);
    constructor(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number);
    get isReversed(): boolean;
    toJSON(): any;
}
//# sourceMappingURL=Type.d.ts.map