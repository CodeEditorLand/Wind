/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for text file model operations
 * at the application layer.
 */

import { Data } from "effect";

import type { HostProblem } from "../Host/Problem.js";

/**
 * Represents a failure that occurs during text file operations, such as
 * saving a file. It wraps lower-level errors to provide a consistent error
 * type for the application.
 */
export class TextEditorProblem extends Data.TaggedError("TextEditorProblem")<{
	readonly Cause: HostProblem | Error;
	readonly Context: string;
}> {}
