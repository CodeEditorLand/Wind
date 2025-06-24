/*
 * File: Wind/Source/Application/Clipboard/Error.ts
 * Role: Defines domain-specific, tagged errors for clipboard operations.
 * Responsibilities:
 *   - Declare structured error types for failures occurring within the
 *     Clipboard application service.
 */

import { Data } from "effect";
import type { IntegrationClipboardProblem } from "Source/Integration/Tauri/Clipboard/Error.js";

/**
 * Represents a failure within the `Clipboard` application service.
 *
 * This error acts as a wrapper around a more specific problem from the
 * Integration layer. This allows higher-level code to catch a single,
 * well-defined error type for this domain, while still preserving the
 * original cause for detailed logging and debugging.
 */
export class ApplicationClipboardProblem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	/** The underlying problem from the Integration layer that caused this failure. */
	readonly Cause: IntegrationClipboardProblem;
}> {}
