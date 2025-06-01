// Application/Dialog/Orchestrate/PickAndOpen.ts
// Purpose: Core logic for pick...AndOpen methods as a piped Effect.

import { Effect, Option, pipe } from "effect";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	// Import the actual Tag instance TS6133 if not used for typeof
	HostServiceTag as ActualHostServiceTag,
	ConvertOpenResultToSingleUri,
	DefineFileOpen,
	DefineFolderOpen,
	DefineWorkspaceOpen,
	RequestHostWindowOpen,
	RequestOpenDialog,
	ResolveFinalDefaultPath,
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
import CreatePickOpenOption from "../Factory/CreatePickOpenOption.js";
import CreateWindowOption from "../Factory/CreateWindowOption.js";
import type { PickProblem } from "../Type.js";

type CombinedVsCodePickOptions = VsCodePickOptions & Partial<VsCodeOpenOptions>;

export default function Orchestrate(
	options: VsCodePickOptions,

	config: {
		titleKey: string;

		defaultTitle: string;

		tauriDirectory: boolean;

		itemType: "file" | "folder" | "workspace";

		defaultWorkspaceFilter?: boolean;
	},
): Effect.Effect<void, PickProblem, typeof ActualHostServiceTag.Type> {
	// Use typeof Tag.Type for service
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

		Effect.flatMap((tauriOptions) => RequestOpenDialog(tauriOptions)),

		Effect.map(ConvertOpenResultToSingleUri),

		Effect.flatMap((maybeUri: Option.Option<UriType>) =>
			Option.match(maybeUri, {
				// This correctly returns Effect<void, never, never>
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

						// This returns Effect<void, WindowProblem, HostService>
					),
			}),
		),
	);
}
