// Integration/Tauri/Error/Dialog.ts
// Purpose: Defines an error for Tauri dialog operations.
import { Data } from "effect";

/**
 * @module Dialog (Error: Problem)
 * @description Represents a problem during Tauri dialog operations (open, save, message).
 */
export default class Problem extends Data.TaggedError("DialogProblem")<{
	readonly cause: unknown;

	readonly operation: "open" | "save" | "message";
}> {
	constructor(props: {
		cause: unknown;

		operation: "open" | "save" | "message";
	}) {
		super(props);
	}
}
