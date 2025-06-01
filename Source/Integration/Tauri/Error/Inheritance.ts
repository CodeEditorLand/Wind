// Integration/Tauri/Error/Inheritance.ts
// Purpose: Defines an error for emulating superclass method calls.
import { Data } from "effect";

/**
 * @module Inheritance (Error: Problem)
 * @description Represents a problem emulating a call to a super method,


 * typically from AbstractFileDialogService.
 */
export default class Problem extends Data.TaggedError("InheritanceProblem")<{
	// The name of the super method being emulated
	readonly method: string;

	readonly cause: unknown;
}> {
	constructor(props: { cause: unknown; method: string }) {
		super(props);
	}
}
