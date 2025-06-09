/*
 * File: Wind/Source/Integration/Notification/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:16 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

export default class Problem extends Data.TaggedError("NotificationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
