import { Effect, Option, pipe } from "effect";
import type {
	IPickAndOpenOptions,
	Partial,
} from "vs/platform/dialogs/common/dialogs";

// Assuming Partial is a VSCode utility or define locally

import {
	effectGetFinalDefaultPath,
	effectOpenInHostService,
	effectTauriOpenDialog,
	HostServiceTag, // Dependency
	makeFileToOpen,
	makeFolderToOpen,
	makeWorkspaceToOpen,
	processTauriOpenResultToSingleUriOption,
	type IOpenDialogOptions, // VSCode type
	type PickAndOpenServiceError, // Error type
} from "../../Effect/Tauri.js";
import {
	pureCreateOpenWindowOptions,
	pureCreatePickAndOpenTauriDialogOptions,
} from "../PureOptionBuilders.js";

export function pickAndOpenLogicImpl(
	options: IPickAndOpenOptions,
	dialogConfig: {
		titleKey: string;
		defaultTitle: string;
		tauriDirectory: boolean;
		itemType: "file" | "folder" | "workspace";
		defaultWorkspaceFilter?: boolean;
	},
): Effect.Effect<void, PickAndOpenServiceError, HostServiceTag> {
	return pipe(
		effectGetFinalDefaultPath(
			(options as IPickAndOpenOptions & Partial<IOpenDialogOptions>)
				.defaultUri,
		),
		Effect.map((defaultPathOpt) =>
			pureCreatePickAndOpenTauriDialogOptions(
				options as IPickAndOpenOptions & Partial<IOpenDialogOptions>,
				dialogConfig,
				defaultPathOpt,
			),
		),
		Effect.flatMap((tauriDialogOpts) =>
			effectTauriOpenDialog(tauriDialogOpts),
		),
		Effect.map(processTauriOpenResultToSingleUriOption),
		Effect.flatMap(
			Option.matchEffect({
				onNone: () => Effect.void,
				onSome: (uri) =>
					effectOpenInHostService(
						[
							dialogConfig.itemType === "folder"
								? makeFolderToOpen(uri)
								: dialogConfig.itemType === "file"
									? makeFileToOpen(uri)
									: makeWorkspaceToOpen(uri),
						],
						pureCreateOpenWindowOptions(options),
					),
			}),
		),
	);
}
