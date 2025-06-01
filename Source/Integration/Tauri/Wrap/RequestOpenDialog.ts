// Integration/Tauri/Wrap/RequestOpenDialog.ts
// Purpose: Effect wrapper for Tauri's open dialog.

import { open as SourceApi } from "@tauri-apps/plugin-dialog";

import { OptionalFromAsync } from "../../../Effect/Produce.js";
import { DialogProblem } from "../Error.js";
// Tauri's OpenDialogOptions
import type { OpenOption as TauriOpenOption } from "../Type.js";

const CreateProblem = (cause: unknown): DialogProblem =>
	new DialogProblem({ cause, operation: "open" });

/**
 * @module RequestOpenDialog
 * @description Effect to request an open dialog from Tauri, yielding an Option.
 */
const Request = OptionalFromAsync(
	SourceApi as (
		options: TauriOpenOption,
	) => Promise<string | string[] | null>,

	CreateProblem,

	{ operation: "open" },
);

export default Request;
