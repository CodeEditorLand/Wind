/*
 * File: Wind/Source/Application/Dialog/Utility/WarnUnsupported.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:03 UTC
 * Dependency: effect
 * Export: Warn
 */

// Application/Dialog/Utility/WarnUnsupported.ts
import { Effect } from "effect";

import {
	// Corrected name
	ShowMessageDialog,
	type DialogProblem,
} from "../../../Integration/Tauri.js";

export default function Warn(
	context: "open" | "save",
): Effect.Effect<void, DialogProblem, never> {
	return ShowMessageDialog(
		// Corrected name
		`The requested file operation (${context}) might not be fully optimal in this environment.`,

		{ title: "Notice", kind: "warning" },
	);
}
