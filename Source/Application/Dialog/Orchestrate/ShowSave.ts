// Application/Dialog/Orchestrate/ShowSave.ts
// Purpose: Core logic for showSaveDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ProcessSaveResultToUri,
	RequestTauriSave,
	ResolveFinalDefaultPath,
	type DialogProblem,
	type Uri,
} from "../../../Integration/Tauri.js";
import CreateSaveOptions from "../Factory/CreateSaveOptions.js";

/**
 * @module ShowSave (Logic Orchestration)
 * @description Orchestrates the logic for showing a save dialog.
 */
export default function Orchestrate(
	options: VsCodeSaveOptions,
): Effect.Effect<Option.Option<Uri>, DialogProblem, never> {
	// Assuming no HostService needed
	return pipe(
		ResolveFinalDefaultPath(options.defaultUri),
		Effect.map((defaultPath) => CreateSaveOptions(options, defaultPath)),
		Effect.flatMap((tauriOptions) => RequestTauriSave(tauriOptions)),
		Effect.map(ProcessSaveResultToUri),
	);
}
