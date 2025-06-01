// Application/Dialog/Orchestrate/ShowSave.ts
// Purpose: Core logic for showSaveDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ProcessSaveResultToUri,
	RequestTauriSave,
	ResolveFinalDefaultPath,
	type OperationProblem,
	type UriType,
} from "../../../Integration/Tauri.js";
import CreateSaveOption from "../Factory/CreateSaveOption.js";

/**
 * @module ShowSave (Orchestration Logic)
 * @description Orchestrates the logic for showing a save dialog.
 */
export default function Orchestrate(
	options: VsCodeSaveOptions,
): Effect.Effect<Option.Option<UriType>, OperationProblem, never> {
	// Context R is never
	return pipe(
		ResolveFinalDefaultPath(options.defaultUri),

		Effect.map((defaultPath) => CreateSaveOption(options, defaultPath)),

		Effect.flatMap((tauriOptions) => RequestTauriSave(tauriOptions)),

		Effect.map(ProcessSaveResultToUri),
	);
}
