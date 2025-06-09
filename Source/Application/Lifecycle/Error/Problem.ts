/*
 * File: Wind/Source/Application/Lifecycle/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:34 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("LifecycleProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
