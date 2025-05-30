// Application/Dialog/Factory/CreatePickOpenOptions.ts
// Purpose: Purely constructs TauriOpenDialogOptions for pick and open scenarios.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	Partial as VsCodePartial, // Assuming this type exists or is defined
	IPickAndOpenOptions as VsCodePickOptions, // Using consistent aliasing/naming
} from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri, // Renamed from vscodeFiltersToTauriFiltersOption
	type TauriDialogFilter,
	type TauriOpenOption, // Renamed from TauriOpenDialogOptions
} from "../../../Integration/Tauri.js";

/**
 * @module CreatePickOpenOptions
 * @description Purely constructs TauriOpenDialogOptions based on VSCode's IPickAndOpenOptions,
 * dialog configuration, and a resolved default path.
 */
export default function Create(
	options: VsCodePickOptions & VsCodePartial<VsCodeOpenOptions>,
	config: {
		titleKey: string;
		defaultTitle: string;
		tauriDirectory: boolean;
		defaultWorkspaceFilter?: boolean;
		itemType: "file" | "folder" | "workspace";
	},
	defaultPath: Option.Option<string>,
): TauriOpenOption {
	// Use renamed type
	return pipe(
		{
			title:
				options.title || localize(config.titleKey, config.defaultTitle),
			multiple: false,
			directory: config.tauriDirectory,
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
								} as TauriDialogFilter,
							])
						: Option.none(),
				),
				Option.filter(() => config.itemType !== "folder"),
				Option.match({
					onNone: () => current,
					onSome: (filters) => ({ ...current, filters }),
				}),
			),
	);
}
