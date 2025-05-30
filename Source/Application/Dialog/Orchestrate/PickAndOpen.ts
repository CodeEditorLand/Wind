// Application/Dialog/Orchestrate/PickAndOpen.ts

import { Effect, Option, pipe } from "effect";
// Make sure these types are correctly imported/aliased
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	Partial as VsCodePartialIfAny,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	DefineFileOpen,
	DefineFolderOpen,
	DefineWorkspaceOpen,
	ProcessOpenResultToSingleUri,
	ProvideHost, // This is the Tag for HostService (PerformHostAction interface)
	RequestHostWindowOpen,
	RequestTauriOpen,
	ResolveFinalDefaultPath,
	type PickProblem, // Error type
	type UriType, // Correct way to import URI type from our Uri.ts
} from "../../../Integration/Tauri.js";
// Aggregator import

import CreatePickOpenOptions from "../Factory/CreatePickOpenOptions.js";
import CreateWindowOptions from "../Factory/CreateWindowOptions.js";

// Assuming VsCodePartial is a utility type like Partial from TS
type CombinedPickOptions = VsCodePickOptions &
	VsCodePartialIfAny<VsCodeOpenOptions>;

/**
 * @module PickAndOpen (Logic Orchestration)
 */
export default function Orchestrate(
	options: VsCodePickOptions,
	config: {
		titleKey: string;
		defaultTitle: string;
		tauriDirectory: boolean;
		itemType: "file" | "folder" | "workspace";
		defaultWorkspaceFilter?: boolean;
	},
): Effect.Effect<void, PickProblem, ProvideHost> {
	return pipe(
		ResolveFinalDefaultPath((options as CombinedPickOptions).defaultUri),
		Effect.map((defaultPath) =>
			CreatePickOpenOptions(
				options as CombinedPickOptions,
				config,
				defaultPath,
			),
		),
		Effect.flatMap((tauriOptions) => RequestTauriOpen(tauriOptions)),
		Effect.map(ProcessOpenResultToSingleUri),
		// Replace Option.matchEffect with Option.match where branches return Effect
		Effect.flatMap(
			(
				maybeUri, // maybeUri is Option<UriType>
			) =>
				Option.match(maybeUri, {
					onNone: () => Effect.void,
					onSome: (selectedUri: UriType) =>
						RequestHostWindowOpen(
							// Explicitly type selectedUri
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
