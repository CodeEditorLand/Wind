/**
 * @module Problem
 * @description
 * This module defines a domain-specific, tagged error for clipboard operations
 * at the application layer. This provides a structured way to handle failures
 * specific to the clipboard domain.
 */

import { Data } from "effect";

import type { IntegrationProblem } from "../Integration/Problem.js";

/**
 * Represents a failure within the `ClipboardService`.
 *
 * This error acts as a wrapper around a more specific problem from the
 * Integration layer (e.g., a failure to communicate with the native host).
 * This allows higher-level application code to catch a single, well-defined
 * error type for this domain, while still preserving the original `Cause` for
 * detailed logging and debugging purposes.
 */
export class ApplicationClipboardProblem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	/**
	 * The underlying problem from the Integration layer that caused this failure.
	 */
	readonly Cause: IntegrationProblem;
}> {}
