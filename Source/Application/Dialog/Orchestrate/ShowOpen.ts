// Application/Dialog/Orchestrate/ShowOpen.ts
// Purpose: Core logic for showOpenDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { IOpenDialogOptions as VsCodeOpenOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ProcessOpenResultToUriArray,
	RequestTauriOpen,
	ResolveFinalDefaultPath,
	// Renamed from DialogProblem for this context
	type OperationProblem,
	type UriType,
	// ProvideHost might not be needed if RequestTauriOpen doesn't depend on it for just showing dialogs
} from "../../../Integration/Tauri.js";
import CreateShowOpenOption from "../Factory/CreateShowOpenOption.js";

/**
 * @module ShowOpen (Orchestration Logic)
 * @description Orchestrates the logic for showing an open dialog.
 */
export default function Orchestrate(
	options: VsCodeOpenOptions,
): Effect.Effect<Option.Option<UriType[]>, OperationProblem, never> {
	// Context R is never if no services needed
	return pipe(
		ResolveFinalDefaultPath(options.defaultUri),

		Effect.flatMap((defaultPath) =>
			pipe(
				options.canSelectFolders && options.canSelectFiles
					? Effect.logWarning(
							"Tauri 'open' dialog: VSCode requested both file and folder selection. Backend behavior for 'directory' flag will determine outcome.",
						)
					: Effect.void,

				Effect.andThen(() =>
					RequestTauriOpen(
						CreateShowOpenOption(options, defaultPath),
					),
				),
			),
		),

		Effect.map(ProcessOpenResultToUriArray),
	);
}
