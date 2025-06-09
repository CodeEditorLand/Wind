/*
 * File: Wind/Source/Integration/Host/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:18 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("HostProblem")<{
	readonly cause: unknown;
	readonly operation: string; // Generic operation name
}> {}
