import {
	documentDir as tauriDocumentDir,
	homeDir as tauriHomeDir,
} from "@tauri-apps/api/path";
// Tauri Plugin Dialog APIs
import {
	message as tauriMessageDialog,
	open as tauriOpenDialog,
	save as tauriSaveDialog,
	type DialogFilter as TauriDialogFilter,
	type OpenDialogOptions as TauriOpenDialogOptions,
	type SaveDialogOptions as TauriSaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { Schemas } from "vs/base/common/network";
import { URI } from "vs/base/common/uri";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ILanguageService } from "vs/editor/common/languages/language";
import { localize } from "vs/nls";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import {
	IFileDialogService,
	IDialogService as IVsCodeDialogService,
	type FileFilter,
	type IOpenDialogOptions,
	type IPickAndOpenOptions,
	type ISaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { type IOpenWindowOptions } from "vs/platform/window/common/window";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { AbstractFileDialogService } from "vs/workbench/services/dialogs/browser/abstractFileDialogService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHistoryService } from "vs/workbench/services/history/common/history";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IPathService } from "vs/workbench/services/path/common/pathService";

async function getDefaultPathForTauri(): Promise<string | undefined> {
	try {
		return await tauriHomeDir();
	} catch (e) {
		try {
			return await tauriDocumentDir();
		} catch (e2) {
			return undefined;
		}
	}
}

function toTauriPath(uri?: URI): string | undefined {
	if (uri && uri.scheme === Schemas.file) {
		return uri.fsPath;
	}

	return undefined;
}

function toTauriFilters(
	vscodeFilters?: readonly FileFilter[],
): TauriDialogFilter[] | undefined {
	if (!vscodeFilters) {
		return undefined;
	}

	return vscodeFilters.map((f: FileFilter) => ({
		name: f.name,
		extensions: [...f.extensions],
	}));
}

export class TauriFileDialogService
	extends AbstractFileDialogService
	implements IFileDialogService
{
	override readonly _serviceBrand: undefined;

	constructor(
		@IHostService protected override readonly hostService: IHostService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IHistoryService historyService: IHistoryService,
		@IWorkbenchEnvironmentService
		environmentService: IWorkbenchEnvironmentService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IFileService fileService: IFileService,
		@IOpenerService openerService: IOpenerService,
		@IVsCodeDialogService dialogService: IVsCodeDialogService,
		@ILanguageService languageService: ILanguageService,
		@IWorkspacesService workspacesService: IWorkspacesService,
		@ILabelService labelService: ILabelService,
		@IPathService pathService: IPathService,
		@ICommandService commandService: ICommandService,
		@IEditorService editorService: IEditorService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@ILogService logService: ILogService,
	) {
		super(
			hostService,
			contextService,
			historyService,
			environmentService,
			instantiationService,
			configurationService,
			fileService,
			openerService,
			dialogService,
			languageService,
			workspacesService,
			labelService,
			pathService,
			commandService,
			editorService,
			codeEditorService,
			logService,
		);

		this._serviceBrand = undefined;
	}

	// FIX (TS2515): Implement inherited abstract member 'pickFileToSave'
	public override async pickFileToSave(
		defaultUri: URI,
		availableFileSystems?: string[],
	): Promise<URI | undefined> {
		const options: ISaveDialogOptions = this.getPickFileToSaveDialogOptions(
			defaultUri,
			availableFileSystems,
		);

		// Ensure title is a string for ISaveDialogOptions if exactOptionalPropertyTypes and strict types demand it
		if (options.title === undefined) {
			// Default title
			options.title = localize("saveAsTitle", "Save As");
		}

		return this.showSaveDialog(options);
	}

	override async pickFileFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const specificOptions = options as IPickAndOpenOptions &
			Partial<IOpenDialogOptions>;

		const defaultPath =
			toTauriPath(specificOptions.defaultUri) ||
			(await getDefaultPathForTauri());

		const tauriDialogOpts: TauriOpenDialogOptions = {
			// FIX (TS2375 related): Ensure title is string if Tauri expects it strictly
			title: specificOptions.title || "Open File or Folder",
			multiple: false,
			// For pickFileFolder, VSCode might expect this to allow folder selection primarily
			directory: true,
		};

		if (defaultPath !== undefined) {
			tauriDialogOpts.defaultPath = defaultPath;
		}

		const selected = await tauriOpenDialog(tauriDialogOpts);

		if (selected && !Array.isArray(selected)) {
			// Tauri returns string for single, string[] for multiple
			const uriToOpen = URI.file(selected);

			const openWindowOpts: IOpenWindowOptions = {
				forceNewWindow: options.forceNewWindow ?? false,
			};

			if (options.remoteAuthority !== undefined) {
				openWindowOpts.remoteAuthority = options.remoteAuthority;
			}

			// Assuming IOpenWindowOptions is now exported and compatible
			await this.hostService.openWindow(
				// Assuming opening as folder if both file/folder was possible
				[{ folderUri: uriToOpen }],
				openWindowOpts,
			);
		}
	}

	override async pickFileAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const specificOptions = options as IPickAndOpenOptions &
			Partial<IOpenDialogOptions>;

		const defaultPath =
			toTauriPath(specificOptions.defaultUri) ||
			(await getDefaultPathForTauri());

		const tauriDialogOpts: TauriOpenDialogOptions = {
			title: specificOptions.title || "Open File",
			multiple: false,
			directory: false,
		};

		if (defaultPath !== undefined) {
			tauriDialogOpts.defaultPath = defaultPath;
		}

		const tauriFilters = toTauriFilters(specificOptions.filters);

		if (tauriFilters !== undefined) {
			tauriDialogOpts.filters = tauriFilters;
		}

		const selected = await tauriOpenDialog(tauriDialogOpts);

		if (selected && !Array.isArray(selected)) {
			const fileUri = URI.file(selected);

			const openWindowOpts: IOpenWindowOptions = {
				forceNewWindow: options.forceNewWindow ?? false,
			};

			if (options.remoteAuthority !== undefined) {
				openWindowOpts.remoteAuthority = options.remoteAuthority;
			}

			await this.hostService.openWindow([{ fileUri }], openWindowOpts);
		}
	}

	override async pickFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const specificOptions = options as IPickAndOpenOptions &
			Partial<IOpenDialogOptions>;

		const defaultPath =
			toTauriPath(specificOptions.defaultUri) ||
			(await getDefaultPathForTauri());

		const tauriDialogOpts: TauriOpenDialogOptions = {
			title: specificOptions.title || "Open Folder",
			multiple: false,
			directory: true,
		};

		if (defaultPath !== undefined) {
			tauriDialogOpts.defaultPath = defaultPath;
		}

		const selected = await tauriOpenDialog(tauriDialogOpts);

		if (selected && !Array.isArray(selected)) {
			const folderUri = URI.file(selected);

			const openWindowOpts: IOpenWindowOptions = {
				forceNewWindow: options.forceNewWindow ?? false,
			};

			if (typeof (options as any).forceReuseWindow === "boolean") {
				openWindowOpts.forceReuseWindow = (
					options as any
				).forceReuseWindow;
			}

			if (options.remoteAuthority !== undefined) {
				openWindowOpts.remoteAuthority = options.remoteAuthority;
			}

			await this.hostService.openWindow([{ folderUri }], openWindowOpts);
		}
	}

	override async pickWorkspaceAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const specificOptions = options as IPickAndOpenOptions &
			Partial<IOpenDialogOptions>;

		const defaultPath =
			toTauriPath(specificOptions.defaultUri) ||
			(await getDefaultPathForTauri());

		const tauriDialogOpts: TauriOpenDialogOptions = {
			title: specificOptions.title || "Open Workspace",
			multiple: false,
			// Workspaces are files
			directory: false,
		};

		if (defaultPath !== undefined) {
			tauriDialogOpts.defaultPath = defaultPath;
		}

		let tauriFilters: TauriDialogFilter[] | undefined = toTauriFilters(
			specificOptions.filters,
		);

		if (!tauriFilters) {
			tauriFilters = [
				{ name: "VS Code Workspace", extensions: ["code-workspace"] },
			];
		}

		// This check is redundant due to the line above, but harmless
		if (tauriFilters !== undefined) {
			tauriDialogOpts.filters = tauriFilters;
		}

		const selected = await tauriOpenDialog(tauriDialogOpts);

		if (selected && !Array.isArray(selected)) {
			const openWindowOpts: IOpenWindowOptions = {
				forceNewWindow: options.forceNewWindow ?? false,
			};

			if (options.remoteAuthority !== undefined) {
				openWindowOpts.remoteAuthority = options.remoteAuthority;
			}

			await this.hostService.openWindow(
				[{ workspaceUri: URI.file(selected) }],
				openWindowOpts,
			);
		}
	}

	override async showOpenDialog(
		options: IOpenDialogOptions,
	): Promise<URI[] | undefined> {
		const defaultPath =
			toTauriPath(options.defaultUri) || (await getDefaultPathForTauri());

		const tauriOptions: TauriOpenDialogOptions = {
			// FIX (TS2375 related): Ensure title is string if Tauri expects it strictly
			title: options.title || "Open",
			multiple: !!options.canSelectMany,
			// Default to files
			directory: false,
		};

		if (defaultPath !== undefined) {
			tauriOptions.defaultPath = defaultPath;
		}

		const tauriFilters = toTauriFilters(options.filters);

		if (tauriFilters !== undefined) {
			tauriOptions.filters = tauriFilters;
		}

		if (options.canSelectFolders && !options.canSelectFiles) {
			tauriOptions.directory = true;
		} else if (options.canSelectFolders && options.canSelectFiles) {
			// Tauri's open dialog cannot select both files and folders simultaneously in a single dialog instance.
			// It's either files or folders. Defaulting to files here.
			// You might need a custom UI or two separate dialogs if true mixed selection is critical.

			// Or handle this case by showing two dialogs, or erroring.
			tauriOptions.directory = false;
		}

		const selected = await tauriOpenDialog(tauriOptions);

		if (selected) {
			const paths = Array.isArray(selected) ? selected : [selected];

			return paths.map((p) => URI.file(p));
		}

		return undefined;
	}

	override async showSaveDialog(
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		const defaultPath =
			toTauriPath(options.defaultUri) || (await getDefaultPathForTauri());

		const tauriOptions: TauriSaveDialogOptions = {
			// FIX (TS2379 & TS2375 related): Ensure title is string
			title: options.title || "Save As",
		};

		if (defaultPath !== undefined) {
			tauriOptions.defaultPath = defaultPath;
		}

		const tauriFilters = toTauriFilters(options.filters);

		if (tauriFilters !== undefined) {
			tauriOptions.filters = tauriFilters;
		}

		const selectedPath = await tauriSaveDialog(tauriOptions);

		if (selectedPath) {
			return URI.file(selectedPath);
		}

		return undefined;
	}

	// FIX (TS4113): Remove 'override' if 'showUnsupportedBrowserWarning' is not in the base class version used by TS
	protected async showUnsupportedBrowserWarning(
		context: "open" | "save",
	): Promise<undefined> {
		await tauriMessageDialog(
			`The requested file operation (${context}) might not be fully optimal in this environment.`,
			// Ensure title is string
			{ title: "Notice", kind: "warning" },
		);

		return undefined;
	}

	// FIX (TS4113 & TS2339): Remove 'override' and `super` call if 'shouldUseSimplified' is not in base
	protected shouldUseSimplified(schema: string): boolean {
		if (
			schema === Schemas.file ||
			schema === Schemas.vscodeUserData ||
			schema === Schemas.tmp
		) {
			return false;
		}

		// Original call, remove if base method doesn't exist
		// const shouldUse = super.shouldUseSimplified(schema);

		// If super.shouldUseSimplified is removed, define logic here or default:
		// Example: default to simplified for non-file schemas, or implement VS Code's logic
		const shouldUse = true;

		return shouldUse;
	}

	// FIX (TS4113): Remove 'override' if 'pickFileToSaveSimplified' is not in the base class version used by TS
	protected override async pickFileToSaveSimplified(
		schema: string,
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		if (schema === Schemas.file) {
			// FIX (TS2379): Ensure title is string for ISaveDialogOptions
			const saveOptions: ISaveDialogOptions = {
				...options,
				// Provide default title
				title: options.title ?? "Save As",
			};

			return this.showSaveDialog(saveOptions);
		}

		// If the method was not in base, `super` call would also be an error.
		// Assuming it *is* in base (as per your provided AbstractFileDialogService.ts),
		// but if TS still errors on `override`, the `super` call would also be problematic if the method isn't found.
		// For now, assuming if `override` is removed, this super call might need to be removed too.
		// However, if the method *is* in base, this super call should be fine if `override` was just a TS hiccup.
		// Given the error is about `override`, not `super`, implies TS *finds* the super method if `override` is removed.
		return super.pickFileToSaveSimplified(schema, options);
	}

	// FIX (TS4113): Remove 'override' if 'pickFileAndOpenSimplified' is not in the base class version used by TS
	protected override async pickFileAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
		// 'remote' or 'preferNewWindow' from base
		remote: boolean,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.pickFileAndOpen(options);
		}

		return super.pickFileAndOpenSimplified(schema, options, remote);
	}

	protected override async pickFolderAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.pickFolderAndOpen(options);
		}

		return super.pickFolderAndOpenSimplified(schema, options);
	}

	protected override async pickWorkspaceAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.pickWorkspaceAndOpen(options);
		}

		return super.pickWorkspaceAndOpenSimplified(schema, options);
	}
}
