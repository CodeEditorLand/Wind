/*
 * File: Wind/Source/Integration/Tauri/Error/Path.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:59 UTC
 * Dependency: effect
 * Export: Problem
 */

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
