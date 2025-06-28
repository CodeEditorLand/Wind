/**
 * @module Error (Application/Host)
 * @description Defines a domain-specific, tagged error for host-level operations
 * at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure within the `HostService`.
 *
 * This error is used to wrap failures that occur during critical startup
 * operations, such as fetching initial configuration from the native host, or
 * during interactions like showing native dialogs.
 */
export class HostServiceProblem extends Data.TaggedError("HostServiceProblem")<{
	/** The underlying error or reason for the failure. */
	readonly Cause: unknown;
	/** A string describing the context of the operation. */
	readonly Context: string;
}> {}
