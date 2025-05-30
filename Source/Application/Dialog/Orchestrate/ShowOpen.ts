// Application/Dialog/Orchestrate/ShowOpen.ts
// Purpose: Core logic for showOpenDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { IOpenDialogOptions as VsCodeOpenOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ProcessOpenResultToUriArray,
	RequestTauriOpen,
	ResolveFinalDefaultPath,
	type DialogProblem, // Renamed DialogOperationError
	type Uri, // Now from Integration/Tauri's re-export
	// HostServiceTag (ProvideHost) not explicitly needed here if RequestTauriOpen doesn't use it.
} from "../../../Integration/Tauri.js";
import CreateShowOpenOptions from "../Factory/CreateShowOpenOptions.js";

/**
 * @module ShowOpen (Logic Orchestration)
 * @description Orchestrates the logic for showing an open dialog.
 */
export default function Orchestrate(
	options: VsCodeOpenOptions,
): Effect.Effect<Option.Option<Uri[]>, DialogProblem, never> {
	// Assuming no HostService needed for just showing dialog
	return pipe(
		ResolveFinalDefaultPath(options.defaultUri),
		Effect.flatMap(
			(
				defaultPath, // Use flatMap to chain the logging effect properly
			) =>
				pipe(
					options.canSelectFolders && options.canSelectFiles
						? Effect.logWarning(
								"Tauri 'open' dialog: VSCode requested both file and folder selection. Backend behavior for 'directory' flag will determine outcome.",
							)
						: Effect.void,
					Effect.andThen(() =>
						RequestTauriOpen(
							CreateShowOpenOptions(options, defaultPath),
						),
					),
				),
		),
		Effect.map(ProcessOpenResultToUriArray),
	);
}
