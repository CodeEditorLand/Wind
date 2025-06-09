/*
 * File: Wind/Source/Integration/Tauri/Error/Window.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:58 UTC
 * Dependency: effect
 * Export: Problem
 */

// Integration/Tauri/Error/Window.ts
// Purpose: Defines an error for VSCode HostService window operations.
import { Data } from "effect";

/**
 * @module Window (Error: Problem)
 * @description Represents a problem when interacting with the VSCode HostService for window operations.
 */
export default class Problem extends Data.TaggedError("WindowProblem")<{
	readonly cause: unknown;

	readonly operation: "hostServiceOpenWindow";
}> {
	constructor(props: { cause: unknown; operation: "hostServiceOpenWindow" }) {
		super(props);
	}
}
