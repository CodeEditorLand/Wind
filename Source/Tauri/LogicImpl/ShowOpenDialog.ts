import { Effect, Option, pipe } from "effect";
import type { IOpenDialogOptions } from "vs/platform/dialogs/common/dialogs";

import {
	effectGetFinalDefaultPath,
	effectTauriOpenDialog,
	HostServiceTag, // HostServiceTag might be unused if no host interaction
	processTauriOpenResultToUriArrayOption,
	type DialogOperationError,
	type URI,
} from "../../Effect/Tauri.js";
import { pureCreateShowOpenDialogTauriOptions } from "../PureOptionBuilders.js";

export function showOpenDialogLogicImpl(
	options: IOpenDialogOptions,
): Effect.Effect<Option.Option<URI[]>, DialogOperationError, HostServiceTag> {
	// Keep HostServiceTag if other logic might need it
	return pipe(
		effectGetFinalDefaultPath(options.defaultUri),
		Effect.flatMap((defaultPathOpt) =>
			pipe(
				options.canSelectFolders && options.canSelectFiles
					? Effect.logWarning(
							"Tauri 'open' dialog: VSCode requested both file and folder selection. Backend behavior for 'directory' flag will determine outcome.",
						)
					: Effect.void,
				Effect.andThen(() =>
					effectTauriOpenDialog(
						pureCreateShowOpenDialogTauriOptions(
							options,
							defaultPathOpt,
						),
					),
				),
			),
		),
		Effect.map(processTauriOpenResultToUriArrayOption),
	);
}
