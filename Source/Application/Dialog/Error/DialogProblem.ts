/*
 * File: Wind/Source/Application/Dialog/Error/DialogProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: effect
 * Export: DialogProblem
 */

// Source/Application/Dialog/Error/DialogProblem.ts
import { Data } from "effect";

import type {
	TauriDialogProblem,
	TauriWindowProblem,
} from "../../../Integration/Tauri.js";

// A specific, typed error for file dialog operations.
export default class DialogProblem extends Data.TaggedError("DialogProblem")<{
	readonly cause: TauriDialogProblem | TauriWindowProblem | Error;
	readonly context: string;
}> {}
