import { Option, pipe } from "effect";
import { localize } from "vs/nls"; // VSCode NLS

import type {
	IOpenDialogOptions,
	IOpenWindowOptions,
	IPickAndOpenOptions,
	ISaveDialogOptions,
	TauriDialogFilter,
	TauriOpenDialogOptions,
	TauriSaveDialogOptions,
} from "../Effect/Tauri/CoreTypes.js";
// Using aggregated types
import { vscodeFiltersToTauriFiltersOption } from "../Effect/Tauri/PureUtils/FilterConverters.js";

export const pureCreatePickAndOpenTauriDialogOptions = (
	options: IPickAndOpenOptions & Partial<IOpenDialogOptions>,
	dialogConfig: {
		titleKey: string;
		defaultTitle: string;
		tauriDirectory: boolean;
		defaultWorkspaceFilter?: boolean;
		itemType: "file" | "folder" | "workspace";
	},
	defaultPathOpt: Option.Option<string>,
): TauriOpenDialogOptions =>
	pipe(
		{
			title:
				options.title ||
				localize(dialogConfig.titleKey, dialogConfig.defaultTitle),
			multiple: false,
			directory: dialogConfig.tauriDirectory,
		} as TauriOpenDialogOptions,
		(currentOpts) =>
			Option.match(defaultPathOpt, {
				onNone: () => currentOpts,
				onSome: (dp) => ({ ...currentOpts, defaultPath: dp }),
			}),
		(currentOpts) =>
			pipe(
				vscodeFiltersToTauriFiltersOption(options.filters),
				Option.orElse(() =>
					dialogConfig.defaultWorkspaceFilter &&
					dialogConfig.itemType === "workspace"
						? Option.some([
								{
									name: "VS Code Workspace",
									extensions: ["code-workspace"],
								} as TauriDialogFilter,
							])
						: Option.none(),
				),
				Option.filter(() => dialogConfig.itemType !== "folder"),
				Option.match({
					onNone: () => currentOpts,
					onSome: (filters) => ({ ...currentOpts, filters }),
				}),
			),
	);

export const pureCreateShowOpenDialogTauriOptions = (
	options: IOpenDialogOptions,
	defaultPathOpt: Option.Option<string>,
): TauriOpenDialogOptions =>
	pipe(
		{
			title: options.title || localize("open", "Open"),
			multiple: !!options.canSelectMany,
			directory: !!options.canSelectFolders,
		} as TauriOpenDialogOptions,
		(currentOpts) =>
			Option.match(defaultPathOpt, {
				onNone: () => currentOpts,
				onSome: (dp) => ({ ...currentOpts, defaultPath: dp }),
			}),
		(currentOpts) =>
			Option.match(vscodeFiltersToTauriFiltersOption(options.filters), {
				onNone: () => currentOpts,
				onSome: (filters) => ({ ...currentOpts, filters }),
			}),
	);

export const pureCreateTauriSaveDialogOptions = (
	options: ISaveDialogOptions,
	defaultPathOpt: Option.Option<string>,
): TauriSaveDialogOptions =>
	pipe(
		{
			title: options.title || localize("saveAsTitle", "Save As"),
		} as TauriSaveDialogOptions,
		(currentOpts) =>
			Option.match(defaultPathOpt, {
				onNone: () => currentOpts,
				onSome: (dp) => ({ ...currentOpts, defaultPath: dp }),
			}),
		(currentOpts) =>
			Option.match(vscodeFiltersToTauriFiltersOption(options.filters), {
				onNone: () => currentOpts,
				onSome: (filters) => ({ ...currentOpts, filters }),
			}),
	);

export const pureCreateOpenWindowOptions = (
	options: IPickAndOpenOptions,
): IOpenWindowOptions =>
	pipe(
		{
			forceNewWindow: options.forceNewWindow ?? false,
		} as IOpenWindowOptions,
		(currentOpts) =>
			typeof (options as any).forceReuseWindow === "boolean"
				? {
						...currentOpts,
						forceReuseWindow: (options as any).forceReuseWindow,
					}
				: currentOpts,
		(currentOpts) =>
			options.remoteAuthority !== undefined
				? { ...currentOpts, remoteAuthority: options.remoteAuthority }
				: currentOpts,
	);
