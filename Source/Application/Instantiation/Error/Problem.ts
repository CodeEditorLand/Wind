/*
 * File: Wind/Source/Application/Instantiation/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:36 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("InstantiationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}

import { Data } from "effect";

export default class Problem extends Data.TaggedError("InstantiationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
