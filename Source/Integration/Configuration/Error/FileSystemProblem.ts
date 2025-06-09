/*
 * File: Wind/Source/Integration/Configuration/Error/FileSystemProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:20 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("FileSystemProblem")<{
	readonly cause: unknown;
	readonly path: string;
}> {}
