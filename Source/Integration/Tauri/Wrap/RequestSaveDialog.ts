// Integration/Tauri/Wrap/RequestSaveDialog.ts
// Purpose: Effect wrapper for Tauri's save dialog.

import { save as SourceApi } from "@tauri-apps/plugin-dialog";

import { OptionalFromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Error.js";
// Tauri's SaveDialogOptions
import type { SaveOption as TauriSaveOption } from "../Type.js";

const CreateProblem = (cause: unknown): DialogProblem =>
	new DialogProblem({ cause, operation: "save" });

/**
 * @module RequestSaveDialog
 * @description Effect to request a save dialog from Tauri, yielding an Option.
 */
const Request = OptionalFromAsync(
	SourceApi as (options: TauriSaveOption) => Promise<string | null>,

	CreateProblem,

	{ operation: "save" },
);

export default Request;
