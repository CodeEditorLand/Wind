/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for window operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `WindowService`, for example, when
 * failing to show a text document because the host could not find a corresponding editor.
 */
export class WindowProblem extends Data.TaggedError("WindowProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
