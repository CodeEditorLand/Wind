// Application/Dialog/Utility/WarnUnsupported.ts
// Purpose: Effect to show a warning dialog for unsupported browser operations (Tauri specific).

import { Effect } from "effect";

import {
	ShowTauriMessage, // Renamed from effectTauriMessageDialog
	type DialogProblem, // Renamed from TauriDialogError
} from "../../../Integration/Tauri.js";

/**
 * @module WarnUnsupported
 * @description Shows a warning message dialog indicating an unsupported browser operation,
 * specific to the Tauri environment.
 */
export default function Warn(
	context: "open" | "save",
): Effect.Effect<void, DialogProblem, never> {
	return ShowTauriMessage(
		`The requested file operation (${context}) might not be fully optimal in this environment.`,
		{ title: "Notice", kind: "warning" },
	);
}
