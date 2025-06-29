/**
 * @module Error (Application/FileSystem)
 * @description Defines domain-specific, tagged errors for filesystem provider
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `FileSystemService`.
 * This typically wraps an error from the underlying `IntegrationService` call,
 * providing a clear, domain-specific error type.
 */
export class FileSystemProblem extends Data.TaggedError("FileSystemProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
