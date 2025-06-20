

/**
 * @module Problem (Clipboard/Error/Integration)
 * @description Defines a structured, tagged error for failures that occur when
 * interacting directly with the Tauri clipboard API.
 */

import { Data } from "effect";

/**
 * Represents a failure at the lowest level of clipboard interaction.
 *
 * This error is created by the Effect wrappers in the Integration layer when a
 * call to `@tauri-apps/api/clipboard` rejects. It captures the underlying cause
 * and the specific operation that failed, providing rich diagnostic information.
 */
export class Problem extends Data.TaggedError("IntegrationClipboardProblem")<{
	/** The original, unknown error thrown by the Tauri API. */
	readonly cause: unknown;
	/** The specific clipboard operation that was being attempted. */
	readonly operation:
		| "ReadText"
		| "WriteText"
		| "ReadImage"
		| "WriteImage"
		| "ReadResourceList"
		| "WriteResourceList"
		| "HasResourceList";
}> {}
