/*
 * File: Wind/Source/Application/Dialog/Orchestrate/ShowOpen.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:05 UTC
 * Dependency: ../Factory/CreateShowOpenOption.js, ../Type.js, effect, vs/platform/dialogs/common/dialogs
 * Export: Orchestrate
 */

// Application/Dialog/Orchestrate/ShowOpen.ts
// Purpose: Core logic for showOpenDialog as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type { IOpenDialogOptions as VsCodeOpenOptions } from "vs/platform/dialogs/common/dialogs";

import {
	// Corrected name
	ConvertOpenResultToUriArray,
	// Corrected name
	RequestOpenDialog,
	ResolveFinalDefaultPath,
	// Corrected type import
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
import CreateShowOpenOption from "../Factory/CreateShowOpenOption.js";
// Corrected import path
import type { OperationProblem } from "../Type.js";

export default function Orchestrate(
	options: VsCodeOpenOptions,
): Effect.Effect<Option.Option<UriType[]>, OperationProblem, never> {
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
					RequestOpenDialog(
						// Corrected name
						CreateShowOpenOption(options, defaultPath),
					),
				),
			),
		),

		// Corrected name
		Effect.map(ConvertOpenResultToUriArray),
	);
}
