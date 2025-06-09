/*
 * File: Wind/Source/Application/Workbench/Error/WorkbenchProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: effect
 * Export: Problem
 */

// Source/Application/Workbench/Error/WorkbenchProblem.ts
import { Data } from "effect";

// A specific error for when the workbench fails during startup.
export default class Problem extends Data.TaggedError("WorkbenchProblem")<{
	readonly cause: unknown;
	readonly context:
		| "ServiceInitialization"
		| "LayoutRendering"
		| "Restoration";
}> {}
