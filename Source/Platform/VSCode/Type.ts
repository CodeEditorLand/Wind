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

// --- Foundational VS Code & Base Imports ---
import { CancellationTokenSource as VSCodeCancellationTokenSource } from "vs/base/common/cancellation.js";
import { CancellationError as VSCodeCancellationError } from "vs/base/common/errors.js";
import { Emitter } from "vs/base/common/event.js";
import { URI as VSCodeURI } from "vs/base/common/uri.js";
import { FileType as VSCodeFileType } from "vs/platform/files/common/files.js";
import type * as VSCode from "vscode";

// --- Direct Re-exports of VS Code Enums and Simple Classes ---
import {
	CompletionItemKind,
	CompletionItemTag,
	ConfigurationTarget,
	DiagnosticSeverity,
	DiagnosticTag,
	EndOfLine,
	ProgressLocation,
	QuickPickItemKind,
	SnippetString,
	StatusBarAlignment,
	TextEditorCursorStyle,
	TreeItemCollapsibleState,
	ViewColumn,
	ProcessExecution as VSCodeProcessExecution,
	Task as VSCodeTask,
	TextEdit as VSCodeTextEdit,
	ThemeIcon as VSCodeThemeIcon,
	WorkspaceEdit as VSCodeWorkspaceEdit,
} from "vscode";

// Re-exporting these directly makes them available under our namespace.
export {
	CompletionItemKind,
	CompletionItemTag,
	ConfigurationTarget,
	DiagnosticSeverity,
	DiagnosticTag,
	EndOfLine,
	ProgressLocation,
	QuickPickItemKind,
	SnippetString,
	StatusBarAlignment,
	TextEditorCursorStyle,
	TreeItemCollapsibleState,
	ViewColumn,
};

// --- Canonical Class Implementations ---

/**
 * The canonical `Disposable` class used throughout the application.
 */
export class Disposable implements VSCode.Disposable {
	private OnDisposeCallback: () => any;

	constructor(OnDisposeCallback: () => any) {
		this.OnDisposeCallback = OnDisposeCallback;
	}
	dispose(): any {
		this.OnDisposeCallback();
	}
	[Symbol.dispose](): void {
		this.dispose();
	}
}

/** The canonical `CancellationTokenSource` class. */
export const CancellationTokenSource = VSCodeCancellationTokenSource;

/** The canonical `CancellationError` class. */
export const CancellationError = VSCodeCancellationError;

/** The canonical `EventEmitter` class. */
export const EventEmitter = Emitter;

/** The canonical `URI` class. */
export const URI = VSCodeURI;
export type Uri = VSCodeURI;

/** The canonical `ThemeIcon` class. */
export const ThemeIcon = VSCodeThemeIcon;

/** The canonical `ProcessExecution` class for Tasks. */
export const ProcessExecution = VSCodeProcessExecution;

/** The canonical `Task` class. */
export const Task = VSCodeTask;

/** The canonical `WorkspaceEdit` class. */
export const WorkspaceEdit = VSCodeWorkspaceEdit;

/** The canonical `TextEdit` class. */
export const TextEdit = VSCodeTextEdit;

/** The canonical `FileType` enum. */
export const FileType = VSCodeFileType;

/**
 * The canonical `Position` class, representing a line and character.
 */
export class Position implements VSCode.Position {
	readonly line: number;
	readonly character: number;

	constructor(line: number, character: number) {
		if (line < 0) {
			throw new Error("Illegal argument: line must be non-negative");
		}
		if (character < 0) {
			throw new Error("Illegal argument: character must be non-negative");
		}
		this.line = line;
		this.character = character;
	}

	isBefore(other: VSCode.Position): boolean {
		return (
			this.line < other.line ||
			(this.line === other.line && this.character < other.character)
		);
	}
	isBeforeOrEqual(other: VSCode.Position): boolean {
		return !new Position(other.line, other.character).isBefore(this);
	}
	isAfter(other: VSCode.Position): boolean {
		return new Position(other.line, other.character).isBefore(this);
	}
	isAfterOrEqual(other: VSCode.Position): boolean {
		return !this.isBefore(other);
	}
	isEqual(other: VSCode.Position): boolean {
		return this.line === other.line && this.character === other.character;
	}
	compareTo(other: VSCode.Position): number {
		if (this.line < other.line) {
			return -1;
		}
		if (this.line > other.line) {
			return 1;
		}
		if (this.character < other.character) {
			return -1;
		}
		if (this.character > other.character) {
			return 1;
		}
		return 0;
	}
	translate(lineDelta?: number, characterDelta?: number): Position;
	translate(change: {
		lineDelta?: number;
		characterDelta?: number;
	}): Position;
	translate(
		lineDeltaOrChange:
			| number
			| { lineDelta?: number; characterDelta?: number }
			| undefined,
		characterDelta = 0,
	): Position {
		if (lineDeltaOrChange === null || lineDeltaOrChange === undefined) {
			return this;
		}
		if (typeof lineDeltaOrChange === "number") {
			return new Position(
				this.line + lineDeltaOrChange,
				this.character + characterDelta,
			);
		}
		return new Position(
			this.line + (lineDeltaOrChange.lineDelta ?? 0),
			this.character + (lineDeltaOrChange.characterDelta ?? 0),
		);
	}
	with(line?: number, character?: number): Position;
	with(change: { line?: number; character?: number }): Position;
	with(
		lineOrChange:
			| number
			| { line?: number; character?: number }
			| undefined,
		character: number = this.character,
	): Position {
		if (lineOrChange === null || lineOrChange === undefined) {
			return this;
		}
		if (typeof lineOrChange === "number") {
			return new Position(lineOrChange, character);
		}
		return new Position(
			lineOrChange.line ?? this.line,
			lineOrChange.character ?? this.character,
		);
	}
	toJSON(): any {
		return { line: this.line, character: this.character };
	}
}

/**
 * The canonical `Range` class, representing a start and end position.
 */
export class Range implements VSCode.Range {
	readonly start: Position;
	readonly end: Position;

	constructor(start: Position, end: Position);
	constructor(
		startLine: number,
		startCharacter: number,
		endLine: number,
		endCharacter: number,
	);
	constructor(
		startLineOrPosition: number | Position,
		startCharacterOrPosition: number | Position,
		endLine?: number,
		endCharacter?: number,
	) {
		let start: Position;
		let end: Position;
		if (
			typeof startLineOrPosition === "number" &&
			typeof startCharacterOrPosition === "number" &&
			typeof endLine === "number" &&
			typeof endCharacter === "number"
		) {
			start = new Position(startLineOrPosition, startCharacterOrPosition);
			end = new Position(endLine, endCharacter);
		} else if (
			startLineOrPosition instanceof Position &&
			startCharacterOrPosition instanceof Position
		) {
			start = startLineOrPosition;
			end = startCharacterOrPosition;
		} else {
			throw new Error("Invalid arguments");
		}
		if (start.isAfter(end)) {
			this.start = end;
			this.end = start;
		} else {
			this.start = start;
			this.end = end;
		}
	}
}

/**
 * The canonical `Selection` class, representing a range with an active cursor position.
 */
export class Selection extends Range implements VSCode.Selection {
	readonly anchor: Position;
	readonly active: Position;

	constructor(anchor: Position, active: Position);
	constructor(
		anchorLine: number,
		anchorCharacter: number,
		activeLine: number,
		activeCharacter: number,
	);
	constructor(
		anchor: Position | number,
		active: Position | number,
		activeLine?: number,
		activeCharacter?: number,
	) {
		let anchorPos: Position;
		let activePos: Position;
		if (
			typeof anchor === "number" &&
			typeof active === "number" &&
			typeof activeLine === "number" &&
			typeof activeCharacter === "number"
		) {
			anchorPos = new Position(anchor, active);
			activePos = new Position(activeLine, activeCharacter);
		} else if (anchor instanceof Position && active instanceof Position) {
			anchorPos = anchor;
			activePos = active;
		} else {
			throw new Error("Invalid arguments");
		}
		super(anchorPos, activePos);
		this.anchor = anchorPos;
		this.active = activePos;
	}
}
