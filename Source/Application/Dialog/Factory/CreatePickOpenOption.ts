/*
 * File: Wind/Source/Application/Dialog/Factory/CreatePickOpenOption.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:06 UTC
 * Dependency: effect, vs/nls
 * Export: Create
 */

// Application/Dialog/Factory/CreatePickOpenOption.ts
// Purpose: Purely constructs TauriOpenDialogOptions for pick and open scenarios.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri,
	// Use DialogFilter
	type DialogFilter as TauriDialogFilter,
	// Use OpenOption
	type OpenOption as TauriOpenOption,
} from "../../../Integration/Tauri.js";

type CombinedVsCodePickOptions = VsCodePickOptions & Partial<VsCodeOpenOptions>;

export default function Create(
	options: CombinedVsCodePickOptions,

	config: {
		titleKey: string;

		defaultTitle: string;

		tauriDirectory: boolean;

		defaultWorkspaceFilter?: boolean;

		itemType: "file" | "folder" | "workspace";
	},

	defaultPath: Option.Option<string>,
): TauriOpenOption {
	// Use the imported OpenOption type
	return pipe(
		{
			title:
				options.title || localize(config.titleKey, config.defaultTitle),

			multiple: false,

			directory: config.tauriDirectory,

			// Cast to ensure base properties
		} as TauriOpenOption,

		(current) =>
			Option.match(defaultPath, {
				onNone: () => current,

				onSome: (path) => ({ ...current, defaultPath: path }),
			}),

		(current) =>
			pipe(
				ConvertFiltersToTauri(options.filters),

				Option.orElse(() =>
					config.defaultWorkspaceFilter &&
					config.itemType === "workspace"
						? Option.some([
								{
									name: "VS Code Workspace",

									extensions: ["code-workspace"],

									// Use DialogFilter type
								} as TauriDialogFilter,
							])
						: Option.none(),
				),

				// Filters usually not for folder picking
				Option.filter(() => config.itemType !== "folder"),

				Option.match({
					onNone: () => current,

					onSome: (filters) => ({ ...current, filters }),
				}),
			),
	);
}
