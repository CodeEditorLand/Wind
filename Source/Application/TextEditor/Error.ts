/**
 * @module Error (Application/TextEditor)
 * @description Defines domain-specific, tagged errors for text editor (file model)
 * operations at the application layer.
 */

import { Data } from "effect";
import type { HostServiceProblem } from "Source/Application/Host/Error.js";

/**
 * Represents a failure that occurs during text file operations, such as saving a file.
 * It wraps lower-level errors to provide a consistent error type for the application.
 */
export class TextEditorProblem extends Data.TaggedError("TextEditorProblem")<{
	readonly Cause: HostServiceProblem | Error;
	readonly Context: string;
}> {}
