// Application/Dialog/Orchestrate/ShowSave.ts
// Purpose: Core logic for showSaveDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	// Corrected name
	ConvertSaveResultToUri,
	// Corrected name
	RequestSaveDialog,
	ResolveFinalDefaultPath,
	// Corrected type import
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
import CreateSaveOption from "../Factory/CreateSaveOption.js";
// Corrected import path
import type { OperationProblem } from "../Type.js";

export default function Orchestrate(
	options: VsCodeSaveOptions,
): Effect.Effect<Option.Option<UriType>, OperationProblem, never> {
	return pipe(
		ResolveFinalDefaultPath(options.defaultUri),

		Effect.map((defaultPath) => CreateSaveOption(options, defaultPath)),

		// Corrected name
		Effect.flatMap((tauriOptions) => RequestSaveDialog(tauriOptions)),

		// Corrected name
		Effect.map(ConvertSaveResultToUri),
	);
}
