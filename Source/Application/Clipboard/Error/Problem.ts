/**
 * @module Problem (Clipboard/Error)
 * @description Defines a domain-specific, tagged error for clipboard operations
 * at the application layer.
 */

import { Data } from "effect";

import type { IntegrationClipboardProblem } from "../../../Integration/Tauri/Clipboard/Error.js";

/**
 * Represents a failure within the Clipboard application service.
 *
 * This error acts as a wrapper around a more specific problem from the
 * Integration layer. This allows higher-level code to catch a single,

 * well-defined error type for this domain, while still preserving the
 * original cause for detailed logging and debugging.
 */
export class Problem extends Data.TaggedError("ApplicationClipboardProblem")<{
	/** The underlying problem from the Integration layer that caused this failure. */
	readonly cause: IntegrationClipboardProblem;
}> {}
