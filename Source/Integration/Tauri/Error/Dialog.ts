/*
 * File: Wind/Source/Integration/Tauri/Error/Dialog.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:59 UTC
 * Dependency: effect
 * Export: Problem
 */

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
