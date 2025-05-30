import { Effect, Option, pipe } from "effect";
import type { ISaveDialogOptions } from "vs/platform/dialogs/common/dialogs";

import {
	effectGetFinalDefaultPath,
	effectTauriSaveDialog,
	HostServiceTag, // HostServiceTag might be unused
	processTauriSaveResultToUriOption,
	type DialogOperationError,
	type URI,
} from "../../Effect/Tauri.js";
import { pureCreateTauriSaveDialogOptions } from "../PureOptionBuilders.js";

export function showSaveDialogLogicImpl(
	options: ISaveDialogOptions,
): Effect.Effect<Option.Option<URI>, DialogOperationError, HostServiceTag> {
	// Keep HostServiceTag for consistency
	return pipe(
		effectGetFinalDefaultPath(options.defaultUri),
		Effect.map((defaultPathOpt) =>
			pureCreateTauriSaveDialogOptions(options, defaultPathOpt),
		),
		Effect.flatMap((tauriSaveOpts) => effectTauriSaveDialog(tauriSaveOpts)),
		Effect.map(processTauriSaveResultToUriOption),
	);
}
