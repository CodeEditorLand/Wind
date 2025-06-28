/**
 * @module Error (Application/File)
 * @description Defines domain-specific, tagged errors for file operations
 * at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a generic failure within the `FileService`.
 * This can be used to wrap lower-level errors (e.g., from a file system provider)
 * to provide a consistent error type for the application to handle.
 */
export class FileProblem extends Data.TaggedError("FileProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
