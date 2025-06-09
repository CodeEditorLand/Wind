/*
 * File: Wind/Source/Integration/Tauri/Error/FileSystem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:14 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("FileSystemProblem")<{
	readonly cause: unknown;
	readonly operation:
		| "stat"
		| "readdir"
		| "readFile"
		| "writeFile"
		| "delete"
		| "rename"
		| "mkdir"
		| "watch"
		| "unwatch";
}> {}
