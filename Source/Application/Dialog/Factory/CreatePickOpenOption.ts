// Application/Dialog/Factory/CreatePickOpenOption.ts
// Purpose: Purely constructs TauriOpenDialogOptions for pick and open scenarios.

import { Option, pipe } from "effect";
import { localize } from "vs/nls";
// Import specific types from VSCode and Tauri integration modules
import type {
	IOpenDialogOptions as VsCodeOpenOptions,
	Partial as VsCodePartialUtil,
	IPickAndOpenOptions as VsCodePickOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	ConvertFiltersToTauri,
	type TauriDialogFilter,
	type TauriOpenOption,
} from "../../../Integration/Tauri.js";

// Assuming VsCodePartialUtil is a utility type e.g. Partial<T>
type CombinedVsCodePickOptions = VsCodePickOptions &
	VsCodePartialUtil<VsCodeOpenOptions>;

/**
 * @module CreatePickOpenOption (Factory)
 * @description Purely constructs TauriOpenOption based on VSCode's IPickAndOpenOptions,
 * dialog configuration, and a resolved default path.
 */
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
				Option.filter(() => config.itemType !== "folder"), // Filters usually not for folder picking
				Option.match({
					onNone: () => current,
					onSome: (filters) => ({ ...current, filters }),
				}),
			),
	);
}
