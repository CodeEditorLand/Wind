/*
 * File: Wind/Source/Application/Editor/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:43 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("EditorProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
