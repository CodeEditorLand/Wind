// Application/Dialog/Orchestrate/PickAndOpen.ts
// Purpose: Core logic for pick...AndOpen methods as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	Partial as VsCodePartial,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	DefineFileOpen, // Renamed factories
	DefineFolderOpen,
	DefineWorkspaceOpen,
	ProcessOpenResultToSingleUri,
	ProvideHost, // Renamed HostServiceTag
	RequestHostWindowOpen, // Renamed from effectOpenInHostService
	RequestTauriOpen,
	ResolveFinalDefaultPath, // Renamed from effectGetFinalDefaultPath
} from "../../../Integration/Tauri.js";
import CreatePickOpenOptions from "../Factory/CreatePickOpenOptions.js";
import CreateWindowOptions from "../Factory/CreateWindowOptions.js";
import type { PickProblem } from "../Types.js"; // Renamed error type

/**
 * @module PickAndOpen (Logic Orchestration)
 * @description Orchestrates the logic for picking a file/folder/workspace and opening it.
 * Requires ProvideHost (IHostService) from context.
 */
export default function Orchestrate(
	options: VsCodePickOptions,
	config: {
		// Renamed dialogConfig
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
			(options as VsCodePickOptions & VsCodePartial<VsCodeOpenOptions>)
				.defaultUri,
		),
		Effect.map((defaultPath) =>
			CreatePickOpenOptions(
				options as VsCodePickOptions & VsCodePartial<VsCodeOpenOptions>,
				config,
				defaultPath,
			),
		),
		Effect.flatMap((tauriOptions) => RequestTauriOpen(tauriOptions)),
		Effect.map(ProcessOpenResultToSingleUri),
		Effect.flatMap(
			Option.matchEffect({
				onNone: () => Effect.void,
				onSome: (selectedUri) =>
					RequestHostWindowOpen(
						// This Effect requires ProvideHost
						[
							config.itemType === "folder"
								? DefineFolderOpen(selectedUri)
								: config.itemType === "file"
									? DefineFileOpen(selectedUri)
									: DefineWorkspaceOpen(selectedUri),
						],
						CreateWindowOptions(options),
					),
			}),
		),
	);
}
