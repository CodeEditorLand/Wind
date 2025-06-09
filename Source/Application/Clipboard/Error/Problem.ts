/*
 * File: Wind/Source/Application/Clipboard/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:48 UTC
 * Dependency: ../../../Integration/Clipboard.js, effect
 * Export: Problem
 */

import { Data } from "effect";
import { ClipboardProblem as IntegrationProblem } from "../../../Integration/Clipboard.js";

export default class Problem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	readonly cause: IntegrationProblem;
}> {}

import { Data } from "effect";
import { ClipboardProblem as IntegrationProblem } from "../../../Integration/Clipboard.js";

export default class Problem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	readonly cause: IntegrationProblem;
}> {}
