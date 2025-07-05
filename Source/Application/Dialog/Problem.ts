/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for dialog operations at the
 * application layer.
 */

import { Data } from "effect";

import type { HostProblem } from "../Host/Problem.js";

/**
 * Represents a failure within the `DialogService`.
 *
 * This error acts as a wrapper around a more specific problem from a lower-level
 * service, like the `HostService`. This allows higher-level code to catch a
 * single, well-defined error type for this domain while preserving the original
 * cause for detailed logging and debugging.
 */
export class DialogProblem extends Data.TaggedError("DialogProblem")<{
	/**
	 * The underlying problem that caused this failure.
	 */
	readonly Cause: HostProblem;
	/**
	 * A string describing the context of the operation (e.g., 'ShowOpenDialogFailed').
	 */
	readonly Context: string;
}> {}
