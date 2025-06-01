// Application/Dialog/Orchestrate/PickAndOpen.ts
// Purpose: Core logic for pick...AndOpen methods as a piped Effect.

import { Effect, Option, pipe, type Context } from "effect";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
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

type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

export default function Orchestrate(
	options: VsCodePickOptions,

	config: {
		titleKey: string;

		defaultTitle: string;

		tauriDirectory: boolean;

		itemType: "file" | "folder" | "workspace";

		defaultWorkspaceFilter?: boolean;
	},
): Effect.Effect<void, PickProblem, HostServiceType> {
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
