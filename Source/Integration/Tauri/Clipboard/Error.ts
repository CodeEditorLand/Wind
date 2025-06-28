/**
 * @module Error (Integration/Tauri/Clipboard)
 * @description Defines a structured, tagged error for failures that occur when
 * interacting directly with the Tauri clipboard API.
 */

import { Data } from "effect";

/**
 * Represents a failure at the lowest level of clipboard interaction.
 *
 * This error is created by the Effect wrappers in this integration layer when a
 * call to a Tauri clipboard command rejects. It captures the underlying cause
 * and the specific operation that failed for rich diagnostics.
 */
export class IntegrationClipboardProblem extends Data.TaggedError(
	"IntegrationClipboardProblem",
)<{
	readonly Cause: unknown;
	readonly Operation:
		| "ReadText"
		| "WriteText"
		| "ReadImage"
		| "WriteImage"
		| "ReadResourceList"
		| "WriteResourceList"
		| "HasResourceList";
}> {}
