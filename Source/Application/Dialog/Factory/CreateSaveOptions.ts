// Application/Dialog/Factory/CreateSaveOptions.ts
// Purpose: Purely constructs TauriSaveDialogOptions.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
import type { ISaveDialogOptions as VsCodeSaveOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri,
	type TauriSaveOption,
} from "../../../Integration/Tauri.js";

/**
 * @module CreateSaveOptions
 * @description Purely constructs TauriSaveDialogOptions for "show save dialog" scenarios.
 */
export default function Create(
	options: VsCodeSaveOptions,
	defaultPath: Option.Option<string>,
): TauriSaveOption {
	return pipe(
		{
			title: options.title || localize("saveAsTitle", "Save As"),
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
