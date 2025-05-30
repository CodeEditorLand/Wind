// Application/Dialog/Utility/WarnUnsupported.ts
import { Effect } from "effect";

import {
	ShowTauriMessage,
	type DialogProblem,
} from "../../../Integration/Tauri.js";

export default function Warn(
	context: "open" | "save",
): Effect.Effect<void, DialogProblem, never> {
	return ShowTauriMessage(
		`The requested file operation (${context}) might not be fully optimal in this environment.`,
		{ title: "Notice", kind: "warning" },
	);
}
