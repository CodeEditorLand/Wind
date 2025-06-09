/*
 * File: Wind/Source/Application/Workspaces/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:25 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("WorkspacesProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}

import { Data } from "effect";

export default class Problem extends Data.TaggedError("WorkspacesProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
