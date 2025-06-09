/*
 * File: Wind/Source/Application/Search/Error/SearchProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: effect
 * Export: GlobParseProblem, RipgrepError, SearchProblem
 */

// Source/Application/Search/Error/SearchProblem.ts
import { Data } from "effect";

export class RipgrepError extends Data.TaggedError("RipgrepError")<{
	readonly cause: unknown;
	readonly exitCode: number;
	readonly stderr: string;
}> {}

export class GlobParseProblem extends Data.TaggedError("GlobParseProblem")<{
	readonly cause: unknown;
	readonly pattern: string;
}> {}

// A union of all possible, typed errors the Search service can produce.
export type SearchProblem = RipgrepError | GlobParseProblem;
