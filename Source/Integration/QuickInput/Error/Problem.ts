/*
 * File: Wind/Source/Integration/QuickInput/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:15 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("QuickInputProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
