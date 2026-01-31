/**
 * @module Type
 * @description
 * This module serves as the canonical source of truth for all foundational types
 * and classes from the VS Code API. It re-exports and implements core data
 * structures like `Uri`, `Range`, `Position`, and `Disposable`.
 *
 * By centralizing these types, we ensure type consistency across the entire
 * application, prevent `instanceof` issues, and isolate direct dependencies
 * on the underlying `@codeeditorland/output` package to a single, controlled location.
 * Every other module in the application should import these types from this file.
 */

import {
	Emitter as VSCodeEmitter,
	type Event as VSCodeEvent,
} from "@codeeditorland/output/vs/base/common/event.js";
import {
	URI as VSCodeURI,
	type UriComponents as VSCodeUriComponents,
} from "@codeeditorland/output/vs/base/common/uri.js";
import type * as VSCode from "vscode";

/**
 * A resource that can be disposed of.
 */
export interface Dispose {
	/**
	 * Disposes of the resource.
	 */
	(): void;
}

/**
 * An object that can be disposed of.
 */
export interface IDisposable {
	/**
	 * Disposes of the object.
	 */
	readonly Dispose: Dispose;
}

/**
 * Represents a typed event.
 *
 * A function that represents an event to which you subscribe by calling it with
 * a listener function as argument.
 *
 * @example
 * item.OnDidChange(function(event) { console.log("Event happened: " + event); });
 */
export type Event<T> = VSCodeEvent<T>;

/**
 * An event emitter can be used to create and manage an {@link Event} for others
 * to subscribe to. One emitter always owns one event.
 *
 * Use this class if you want to provide an event from within your extension.
 */
export const CreateEmitter = <T>(): VSCodeEmitter<T> => new VSCodeEmitter<T>();

/**
 * The canonical `URI` class used throughout the application, representing a
 * universal resource identifier.
 */
export type Uri = VSCodeURI;
export const Uri = VSCodeURI;

/**
 * The Data Transfer Object (DTO) for a `Uri`, used for serialization.
 */
export type UriDTO = VSCodeUriComponents;

/**
 * Represents a line and character position, such as the position of the cursor.
 * Position objects are immutable.
 */
export class Position {
	/**
	 * The zero-based line value.
	 */
	public readonly Line: number;

	/**
	 * The zero-based character value.
	 */
	public readonly Character: number;

	/**
	 * Creates a new Position object.
	 * @param Line A zero-based line value. Must be non-negative.
	 * @param Character A zero-based character value. Must be non-negative.
	 */
	constructor(Line: number, Character: number) {
		if (Line < 0) {
			throw new Error("Argument 'Line' must be non-negative.");
		}
		if (Character < 0) {
			throw new Error("Argument 'Character' must be non-negative.");
		}
		this.Line = Line;
		this.Character = Character;
	}

	/**
	 * Checks if this position is before another position.
	 * @param Other The other position to compare against.
	 * @returns `true` if this position is before `Other`.
	 */
	public IsBefore(Other: Position): boolean {
		if (this.Line < Other.Line) {
			return true;
		}
		if (Other.Line < this.Line) {
			return false;
		}
		return this.Character < Other.Character;
	}

	/**
	 * Checks if this position is before or equal to another position.
	 * @param Other The other position to compare against.
	 * @returns `true` if this position is before or equal to `Other`.
	 */
	public IsBeforeOrEqual(Other: Position): boolean {
		return !new Position(Other.Line, Other.Character).IsBefore(this);
	}

	/**
	 * Checks if this position is after another position.
	 * @param Other The other position to compare against.
	 * @returns `true` if this position is after `Other`.
	 */
	public IsAfter(Other: Position): boolean {
		return !this.IsBeforeOrEqual(Other);
	}

	/**
	 * Checks if this position is after or equal to another position.
	 * @param Other The other position to compare against.
	 * @returns `true` if this position is after or equal to `Other`.
	 */
	public IsAfterOrEqual(Other: Position): boolean {
		return !this.IsBefore(Other);
	}

	/**
	 * Checks if this position is equal to another position.
	 * @param Other The other position to compare against.
	 * @returns `true` if the positions are equal.
	 */
	public IsEqual(Other: Position): boolean {
		return this.Line === Other.Line && this.Character === Other.Character;
	}

	/**
	 * Creates a new position relative to this position.
	 * @param LineDelta Delta value for the line.
	 * @param CharacterDelta Delta value for the character.
	 * @returns A new, translated position.
	 */
	public Translate(
		LineDelta: number = 0,
		CharacterDelta: number = 0,
	): Position {
		return new Position(
			this.Line + LineDelta,
			this.Character + CharacterDelta,
		);
	}

	/**
	 * Creates a new position derived from this position.
	 * @param Change An object describing the change.
	 * @returns A new position with the applied changes.
	 */
	public With(Change: { Line?: number; Character?: number }): Position {
		return new Position(
			Change.Line ?? this.Line,
			Change.Character ?? this.Character,
		);
	}
}

/**
 * Represents a range of text in a document, defined by a start and end position.
 * A range is guaranteed to be ordered, i.e., `Start` is before or equal to `End`.
 * Range objects are immutable.
 */
export class Range {
	/**
	 * The start position of the range.
	 */
	public readonly Start: Position;

	/**
	 * The end position of the range.
	 */
	public readonly End: Position;

	/**
	 * Creates a new range from two positions.
	 * If `Start` is not before or equal to `End`, the values will be swapped.
	 * @param Start The start position.
	 * @param End The end position.
	 */
	constructor(Start: Position, End: Position);
	/**
	 * Creates a new range from number coordinates.
	 * @param StartLine The zero-based start line.
	 * @param StartCharacter The zero-based start character.
	 * @param EndLine The zero-based end line.
	 * @param EndCharacter The zero-based end character.
	 */
	constructor(
		StartLine: number,
		StartCharacter: number,
		EndLine: number,
		EndCharacter: number,
	);
	constructor(
		StartLineOrPosition: number | Position,
		StartCharacterOrPosition: number | Position,
		EndLine?: number,
		EndCharacter?: number,
	) {
		let Start: Position;
		let End: Position;

		if (
			typeof StartLineOrPosition === "number" &&
			typeof StartCharacterOrPosition === "number" &&
			typeof EndLine === "number" &&
			typeof EndCharacter === "number"
		) {
			Start = new Position(StartLineOrPosition, StartCharacterOrPosition);
			End = new Position(EndLine, EndCharacter);
		} else if (
			StartLineOrPosition instanceof Position &&
			StartCharacterOrPosition instanceof Position
		) {
			Start = StartLineOrPosition;
			End = StartCharacterOrPosition;
		} else {
			throw new Error("Invalid arguments for Range constructor");
		}

		if (Start.IsAfter(End)) {
			this.Start = End;
			this.End = Start;
		} else {
			this.Start = Start;
			this.End = End;
		}
	}

	/**
	 * `true` if the range is empty.
	 */
	public get IsEmpty(): boolean {
		return this.Start.IsEqual(this.End);
	}

	/**
	 * `true` if the range spans a single line.
	 */
	public get IsSingleLine(): boolean {
		return this.Start.Line === this.End.Line;
	}

	/**
	 * Checks if a position or another range is contained within this range.
	 * @param PositionOrRange The position or range to check.
	 * @returns `true` if the given position or range is inside this range.
	 */
	public Contains(PositionOrRange: Position | Range): boolean {
		if (PositionOrRange instanceof Range) {
			return (
				this.Contains(PositionOrRange.Start) &&
				this.Contains(PositionOrRange.End)
			);
		}
		return (
			PositionOrRange.IsAfterOrEqual(this.Start) &&
			PositionOrRange.IsBeforeOrEqual(this.End)
		);
	}

	/**
	 * Checks if another range is equal to this range.
	 * @param Other The other range to compare against.
	 * @returns `true` if the ranges are equal.
	 */
	public IsEqual(Other: Range): boolean {
		return this.Start.IsEqual(Other.Start) && this.End.IsEqual(Other.End);
	}

	/**
	 * Creates a new range that is the intersection of this range and another range.
	 * @param Other The other range to intersect with.
	 * @returns The intersection range, or `undefined` if there is no overlap.
	 */
	public Intersection(Other: Range): Range | undefined {
		const Start = this.Start.IsAfter(Other.Start)
			? this.Start
			: Other.Start;
		const End = this.End.IsBefore(Other.End) ? this.End : Other.End;
		if (Start.IsAfter(End)) {
			return undefined;
		}
		return new Range(Start, End);
	}

	/**
	 * Creates a new range that is the union of this range and another range.
	 * @param Other The other range to union with.
	 * @returns A new range that encompasses both ranges.
	 */
	public Union(Other: Range): Range {
		const Start = this.Start.IsBefore(Other.Start)
			? this.Start
			: Other.Start;
		const End = this.End.IsAfter(Other.End) ? this.End : Other.End;
		return new Range(Start, End);
	}

	/**
	 * Creates a new range derived from this range.
	 * @param Change An object describing the change.
	 * @returns A new range with the applied changes.
	 */
	public With(Change: { Start?: Position; End?: Position }): Range {
		return new Range(Change.Start ?? this.Start, Change.End ?? this.End);
	}
}

/**
 * Represents a selection in an editor.
 * A selection is a range with an active cursor position and an anchor position.
 */
export class Selection extends Range implements VSCode.Selection {
	/**
	 * The position at which the selection starts.
	 * This position might be before or after `Active`.
	 */
	public readonly Anchor: Position;

	/**
	 * The position of the cursor.
	 * This position might be before or after `Anchor`.
	 */
	public readonly Active: Position;

	/**
	 * Create a new selection from two positions.
	 * @param Anchor The anchor position.
	 * @param Active The active (cursor) position.
	 */
	constructor(Anchor: Position, Active: Position);
	/**
	 * Create a new selection from four coordinates.
	 * @param AnchorLine The zero-based line of the anchor.
	 * @param AnchorCharacter The zero-based character of the anchor.
	 * @param ActiveLine The zero-based line of the active position.
	 * @param ActiveCharacter The zero-based character of the active position.
	 */
	constructor(
		AnchorLine: number,
		AnchorCharacter: number,
		ActiveLine: number,
		ActiveCharacter: number,
	);
	constructor(
		Anchor: Position | number,
		Active: Position | number,
		ActiveLine?: number,
		ActiveCharacter?: number,
	) {
		let AnchorPosition: Position;
		let ActivePosition: Position;

		if (
			typeof Anchor === "number" &&
			typeof Active === "number" &&
			typeof ActiveLine === "number" &&
			typeof ActiveCharacter === "number"
		) {
			AnchorPosition = new Position(Anchor, Active);
			ActivePosition = new Position(ActiveLine, ActiveCharacter);
		} else if (Anchor instanceof Position && Active instanceof Position) {
			AnchorPosition = Anchor;
			ActivePosition = Active;
		} else {
			throw new Error("Invalid arguments for Selection constructor");
		}

		super(AnchorPosition, ActivePosition);
		this.Anchor = AnchorPosition;
		this.Active = ActivePosition;
	}

	/**
	 * `true` if the selection is reversed (i.e., the active position is before the anchor).
	 */
	public get IsReversed(): boolean {
		return this.Active.IsBefore(this.Anchor);
	}
}
