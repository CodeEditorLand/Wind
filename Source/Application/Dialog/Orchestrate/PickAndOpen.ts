// Application/Dialog/Orchestrate/PickAndOpen.ts
// Purpose: Core logic for pick...AndOpen methods as a piped Effect.

import { Effect, Option } from "effect";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	ConvertOpenResultToSingleUri,
	DefineFileOpen,
	DefineFolderOpen,
	DefineWorkspaceOpen,
	// This effect requires HostServiceTag
	RequestHostWindowOpen,
	RequestOpenDialog,
	ResolveFinalDefaultPath,
	type Uri as UriType,
} from "../../../Integration/Tauri.js";
// Import the Tag itself
import HostServiceTag from "../../../Platform/VSCode/Provide/Host.js";
import CreatePickOpenOption from "../Factory/CreatePickOpenOption.js";
import CreateWindowOption from "../Factory/CreateWindowOption.js";
import type { PickProblem } from "../Type.js";

type CombinedVsCodePickOptions = VsCodePickOptions & Partial<VsCodeOpenOptions>;

/**
 * Orchestrates the "pick and open" dialog flow.
 * @param options VSCode pick and open options.
 * @param config Configuration for the dialog behavior and item type.
 * @returns An Effect that performs the operation.
 *          The Effect requires `HostServiceTag` in its context if an item is selected to be opened.
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
): Effect.Effect<void, PickProblem, typeof HostServiceTag> {
	// R is HostServiceTag
	return ResolveFinalDefaultPath(
		(options as CombinedVsCodePickOptions).defaultUri,
	).pipe(
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
				// This branch has R = never
				onNone: () => Effect.void,

				// RequestHostWindowOpen is Effect<void, WindowProblem, typeof HostServiceTag>
				// This branch correctly introduces the HostServiceTag requirement.
				onSome: (selectedUri: UriType) =>
					RequestHostWindowOpen(
						// Call the function that returns the Effect
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
