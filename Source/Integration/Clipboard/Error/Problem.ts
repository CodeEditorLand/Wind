/*
 * File: Wind/Source/Integration/Clipboard/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:22 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("ClipboardProblem")<{
	readonly cause: unknown;
	readonly operation: "readText" | "writeText" | "readImage" | "writeImage";
}> {}

import { Data } from "effect";

export default class Problem extends Data.TaggedError("ClipboardProblem")<{
	readonly cause: unknown;
	readonly operation: "readText" | "writeText" | "readImage" | "writeImage";
}> {}
