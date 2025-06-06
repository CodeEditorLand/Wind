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
