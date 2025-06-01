// Integration/Tauri/Error/Path.ts
// Purpose: Defines an error for Tauri path operations.
import { Data } from "effect";

/**
 * @module Path (Error: Problem)
 * @description Represents a problem during Tauri path operations (homeDir, documentDir).
 * The class name is generic 'Problem'; its specific meaning (PathProblem)
 * is derived from the file path and its internal tag 'PathProblem'.
 */
export default class Problem extends Data.TaggedError("PathProblem")<{
	readonly cause: unknown;

	readonly operation: "homeDir" | "documentDir";
}> {
	constructor(props: {
		cause: unknown;

		operation: "homeDir" | "documentDir";
	}) {
		super(props);
	}
}
