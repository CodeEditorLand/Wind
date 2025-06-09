/*
 * File: Wind/Source/Integration/Configuration/Error/JsonParseProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:19 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("JsonParseProblem")<{
	readonly cause: unknown;
}> {}
