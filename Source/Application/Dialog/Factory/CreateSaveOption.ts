// Application/Dialog/Factory/CreateSaveOption.ts
// Purpose: Purely constructs TauriSaveDialogOptions.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri,
	// Use SaveOption
	type SaveOption as TauriSaveOption,
} from "../../../Integration/Tauri.js";

export default function Create(
	options: VsCodeSaveOptions,

	defaultPath: Option.Option<string>,
): TauriSaveOption {
	// Use the imported SaveOption type
	return pipe(
		{
			title: options.title || localize("saveAsTitle", "Save As"),

			// Cast to ensure base properties
		} as TauriSaveOption,

		(current) =>
			Option.match(defaultPath, {
				onNone: () => current,

				onSome: (path) => ({ ...current, defaultPath: path }),
			}),

		(current) =>
			Option.match(ConvertFiltersToTauri(options.filters), {
				onNone: () => current,

				onSome: (filters) => ({ ...current, filters }),
			}),
	);
}
