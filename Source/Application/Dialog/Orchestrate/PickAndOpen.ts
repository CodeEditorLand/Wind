// Application/Dialog/Orchestrate/PickAndOpen.ts
// Purpose: Core logic for pick...AndOpen methods as a piped Effect.

import { Effect, Option, pipe } from "effect";
// Import specific types from VSCode dialogs
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	Partial as VsCodePartialUtil,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	DefineFileOpen,
	DefineFolderOpen,
	DefineWorkspaceOpen,
	ProcessOpenResultToSingleUri,
	// Tag for HostService
	ProvideHost,
	RequestHostWindowOpen,
	RequestTauriOpen,
	ResolveFinalDefaultPath,
	// VSCode URI type
	type UriType,
} from "../../../Integration/Tauri.js";
import CreatePickOpenOption from "../Factory/CreatePickOpenOption.js";
import CreateWindowOption from "../Factory/CreateWindowOption.js";
// Aggregator for Integration/Tauri
// Service-specific error type
import type { PickProblem } from "../Type.js";

// Assuming VsCodePartialUtil is a utility type like Partial from TS
type CombinedVsCodePickOptions = VsCodePickOptions &
	VsCodePartialUtil<VsCodeOpenOptions>;

/**
 * @module PickAndOpen (Orchestration Logic)
 * @description Orchestrates the logic for picking a file/folder/workspace and opening it.
 * Requires ProvideHost (IHostService) from context for window operations.
 */
export default function Orchestrate(
	options: VsCodePickOptions,

	config: {
		// Renamed dialogConfig to config for brevity
		titleKey: string;

		defaultTitle: string;

		tauriDirectory: boolean;

		itemType: "file" | "folder" | "workspace";

		defaultWorkspaceFilter?: boolean;
	},
): Effect.Effect<void, PickProblem, ProvideHost> {
	// Dependencies declared in R
	return pipe(
		ResolveFinalDefaultPath(
			(options as CombinedVsCodePickOptions).defaultUri,
		),

		Effect.map((defaultPath) =>
			CreatePickOpenOption(
				options as CombinedVsCodePickOptions,

				config,

				defaultPath,
			),
		),

		Effect.flatMap((tauriOptions) => RequestTauriOpen(tauriOptions)),

		Effect.map(ProcessOpenResultToSingleUri),

		Effect.flatMap(
			(
				// maybeUri is Option<UriType>
				maybeUri,
			) =>
				Option.match(maybeUri, {
					// Use Option.match; branches return Effect
					onNone: () => Effect.void,

					onSome: (selectedUri: UriType) =>
						RequestHostWindowOpen(
							[
								config.itemType === "folder"
									? DefineFolderOpen(selectedUri)
									: config.itemType === "file"
										? DefineFileOpen(selectedUri)
										: DefineWorkspaceOpen(selectedUri),
							],

							CreateWindowOption(options),
						),
				}),
		),
	);
}
