// Application/Dialog/Factory/CreateShowOpenOption.ts
// Purpose: Purely constructs TauriOpenDialogOptions for "show open" scenarios.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
import type { IOpenDialogOptions as VsCodeOpenOptions } from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri,
	type TauriOpenOption,
} from "../../../Integration/Tauri.js";

/**
 * @module CreateShowOpenOption (Factory)
 * @description Purely constructs TauriOpenOption for "show open dialog" scenarios.
 */
export default function Create(
	options: VsCodeOpenOptions,

	defaultPath: Option.Option<string>,
): TauriOpenOption {
	return pipe(
		{
			title: options.title || localize("open", "Open"),

			multiple: !!options.canSelectMany,

			// Prioritize folder if canSelectFolders is true
			directory: !!options.canSelectFolders,
		} as TauriOpenOption,

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
