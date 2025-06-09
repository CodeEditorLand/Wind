/*
 * File: Wind/Source/Application/Notification/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:32 UTC
 * Dependency: ../../../Integration/Tauri.js, effect
 * Export: Problem
 */

import { Data } from "effect";

import { DialogProblem } from "../../../Integration/Tauri.js";

export default class Problem extends Data.TaggedError("NotificationProblem")<{
	readonly cause: DialogProblem | Error;
	readonly context: string;
}> {}
