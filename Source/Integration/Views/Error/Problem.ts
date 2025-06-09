/*
 * File: Wind/Source/Integration/Views/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:11 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("ViewStateProblem")<{
	readonly cause: unknown;
	readonly operation: "fetch" | "store";
}> {}
