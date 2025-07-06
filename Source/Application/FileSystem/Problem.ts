/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for filesystem provider operations
 * at the application layer.
 */

import { Data } from "effect";

import type { HostProblem } from "../Host/Problem.js";

/**
 * Represents a failure that occurs within the `FileSystemService`.
 * This typically wraps an error from the underlying `HostService` call,
 * providing a clear, domain-specific error type for consumers.
 */
export class FileSystemProblem extends Data.TaggedError("FileSystemProblem")<{
	readonly Cause: HostProblem;
	readonly Context: string;
}> {}
