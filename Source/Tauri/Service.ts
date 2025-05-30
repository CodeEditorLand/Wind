import type {
	DialogFilter as TauriDialogFilter,
	OpenDialogOptions as TauriOpenDialogOptions,
	SaveDialogOptions as TauriSaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { Context, Data, Effect, Layer, Option, pipe } from "effect";
// VSCode specific imports
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
import {
	type IFileToOpen,
	type IFolderToOpen,
	type IOpenWindowOptions,
	type IWorkspaceToOpen,
} from "vs/platform/window/common/window";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { AbstractFileDialogService } from "vs/workbench/services/dialogs/browser/abstractFileDialogService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHistoryService } from "vs/workbench/services/history/common/history";
import { IHostService as IVsCodeHostService } from "vs/workbench/services/host/browser/host"; // Aliased
import { IPathService } from "vs/workbench/services/path/common/pathService";

// Import helpers and error types
import {
	effectGetFinalDefaultPath,
	effectOpenInHostService,
	effectTauriMessageDialog,
	effectTauriOpenDialog,
	effectTauriSaveDialog,
	HostService,
	makeFileToOpen,
	makeFolderToOpen,
	makeWorkspaceToOpen,
	OpenWindowError,
	processTauriOpenResultToSingleUriOption,
	processTauriOpenResultToUriArrayOption,
	processTauriSaveResultToUriOption,
	SuperCallError,
	TauriDialogError,
	TauriPathError,
	vscodeFiltersToTauriFiltersOption,
} from "../Effect/Tauri.js";

// --- Error Union Types for this service ---
type DialogOperationError = TauriPathError | TauriDialogError;
type PickAndOpenServiceError = DialogOperationError | OpenWindowError;
type FileDialogServiceError = PickAndOpenServiceError | SuperCallError;

// --- Pure helper functions for constructing options (can remain here or be moved) ---
// These helpers might use internal `const` for clarity, but are pure from outside.
const _pureCreateTauriOpenDialogOptions = (
	title: string,
	isMultiple: boolean,
	isDirectory: boolean,
	defaultPathOpt: Option.Option<string>,
	filtersOpt: Option.Option<TauriDialogFilter[]>,
): TauriOpenDialogOptions =>
	pipe(
		{ title, multiple: isMultiple, directory } as TauriOpenDialogOptions,
		(currentOpts) =>
			Option.match(defaultPathOpt, {
				onNone: () => currentOpts,
				onSome: (dp) => ({ ...currentOpts, defaultPath: dp }),
			}),
		(currentOpts) =>
			Option.match(filtersOpt, {
				onNone: () => currentOpts,
				onSome: (filters) => ({ ...currentOpts, filters }),
			}),
	);

const _pureCreateTauriSaveDialogOptions = (
	title: string,
	defaultPathOpt: Option.Option<string>,
	filtersOpt: Option.Option<TauriDialogFilter[]>,
): TauriSaveDialogOptions =>
	pipe(
		{ title } as TauriSaveDialogOptions,
		(currentOpts) =>
			Option.match(defaultPathOpt, {
				onNone: () => currentOpts,
				onSome: (dp) => ({ ...currentOpts, defaultPath: dp }),
			}),
		(currentOpts) =>
			Option.match(filtersOpt, {
				onNone: () => currentOpts,
				onSome: (filters) => ({ ...currentOpts, filters }),
			}),
	);

const _pureCreateOpenWindowOptions = (
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

export class TauriFileDialogService
	extends AbstractFileDialogService
	implements IFileDialogService
{
	override readonly _serviceBrand: undefined;
	private readonly effectHostService: IVsCodeHostService;

	constructor(
		@IVsCodeHostService hostService: IVsCodeHostService,
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
		this.effectHostService = hostService;
		this._serviceBrand = undefined;
	}

	private runEffect<A, E extends FileDialogServiceError>(
		effect: Effect.Effect<A, E, HostService>,
	): Promise<A> {
		return Effect.runPromise(
			Effect.provideService(effect, HostService, this.effectHostService),
		);
	}
	private runEffectOption<A, E extends FileDialogServiceError>(
		effect: Effect.Effect<Option.Option<A>, E, HostService>,
	): Promise<A | undefined> {
		return this.runEffect(effect.pipe(Effect.map(Option.getOrUndefined)));
	}
	private runEffectToVoid<E extends FileDialogServiceError>(
		effect: Effect.Effect<any, E, HostService>,
	): Promise<void> {
		return this.runEffect(Effect.void(effect));
	}

	// --- Internal Effect-based Logic (Maximally Piped) ---

	private _pickAndOpenLogic(
		options: IPickAndOpenOptions,
		dialogConfig: {
			titleKey: string;
			defaultTitle: string;
			tauriDirectory: boolean;
			itemType: "file" | "folder" | "workspace";
			defaultWorkspaceFilter?: boolean;
		},
	): Effect.Effect<void, PickAndOpenServiceError, HostService> {
		return pipe(
			effectGetFinalDefaultPath(
				(options as IPickAndOpenOptions & Partial<IOpenDialogOptions>)
					.defaultUri,
			),
			Effect.map(
				(
					defaultPathOpt, // Result of previous Effect is defaultPathOpt
				) =>
					_pureCreateTauriOpenDialogOptions(
						// This is a pure function
						(
							options as IPickAndOpenOptions &
								Partial<IOpenDialogOptions>
						).title ||
							localize(
								dialogConfig.titleKey,
								dialogConfig.defaultTitle,
							),
						false, // multiple
						dialogConfig.tauriDirectory,
						defaultPathOpt,
						pipe(
							// Pure computation for filters
							vscodeFiltersToTauriFiltersOption(
								(
									options as IPickAndOpenOptions &
										Partial<IOpenDialogOptions>
								).filters,
							),
							Option.orElse(() =>
								dialogConfig.defaultWorkspaceFilter
									? Option.some([
											{
												name: "VS Code Workspace",
												extensions: ["code-workspace"],
											} as TauriDialogFilter,
										])
									: Option.none(),
							),
							Option.filter(
								() => dialogConfig.itemType !== "folder",
							), // Only apply if not folder
						),
					),
			),
			Effect.flatMap((tauriDialogOpts) =>
				effectTauriOpenDialog(tauriDialogOpts),
			),
			Effect.map(processTauriOpenResultToSingleUriOption),
			Effect.flatMap(
				Option.matchEffect({
					onNone: () => Effect.void,
					onSome: (uri) =>
						effectOpenInHostService(
							[
								dialogConfig.itemType === "folder"
									? makeFolderToOpen(uri)
									: dialogConfig.itemType === "file"
										? makeFileToOpen(uri)
										: makeWorkspaceToOpen(uri),
							],
							_pureCreateOpenWindowOptions(options),
						),
				}),
			),
		);
	}

	private _showOpenDialogLogic(
		options: IOpenDialogOptions,
	): Effect.Effect<Option.Option<URI[]>, DialogOperationError, HostService> {
		return pipe(
			effectGetFinalDefaultPath(options.defaultUri),
			Effect.flatMap((defaultPathOpt) =>
				pipe(
					options.canSelectFolders && options.canSelectFiles
						? Effect.logWarning(
								"Tauri 'open' dialog cannot select both files and folders. Prioritizing folders.",
							)
						: Effect.void,
					Effect.andThen(() =>
						effectTauriOpenDialog(
							_pureCreateTauriOpenDialogOptions(
								options.title || localize("open", "Open"),
								!!options.canSelectMany,
								!!options.canSelectFolders, // if canSelectFiles is also true, directory becomes true
								!!options.canSelectFiles,
								defaultPathOpt,
								vscodeFiltersToTauriFiltersOption(
									options.filters,
								),
							),
						),
					),
				),
			),
			Effect.map(processTauriOpenResultToUriArrayOption),
		);
	}

	private _showSaveDialogLogic(
		options: ISaveDialogOptions,
	): Effect.Effect<Option.Option<URI>, DialogOperationError, HostService> {
		return pipe(
			effectGetFinalDefaultPath(options.defaultUri),
			Effect.map((defaultPathOpt) =>
				_pureCreateTauriSaveDialogOptions(
					options.title || localize("saveAsTitle", "Save As"),
					defaultPathOpt,
					vscodeFiltersToTauriFiltersOption(options.filters),
				),
			),
			Effect.flatMap((tauriSaveOpts) =>
				effectTauriSaveDialog(tauriSaveOpts),
			),
			Effect.map(processTauriSaveResultToUriOption),
		);
	}

	// --- Public IFileDialogService Methods ---
	public override async pickFileToSave(
		defaultUri: URI,
		availableFileSystems?: string[],
	): Promise<URI | undefined> {
		return this.runEffectOption(
			this._showSaveDialogLogic(
				// Pure construction of ISaveDialogOptions
				((uri, systems) => {
					const opts = this.getPickFileToSaveDialogOptions(
						uri,
						systems,
					);
					if (opts.title === undefined)
						opts.title = localize("saveAsTitle", "Save As");
					return opts;
				})(defaultUri, availableFileSystems),
			),
		);
	}

	override async pickFileFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		return this.runEffectToVoid(
			this._pickAndOpenLogic(options, {
				titleKey: "openFileOrFolderDefaultTitle",
				defaultTitle: "Open File or Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		);
	}

	override async pickFileAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		return this.runEffectToVoid(
			this._pickAndOpenLogic(options, {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
				tauriDirectory: false,
				itemType: "file",
			}),
		);
	}

	override async pickFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		return this.runEffectToVoid(
			this._pickAndOpenLogic(options, {
				titleKey: "openFolderDefaultTitle",
				defaultTitle: "Open Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		);
	}

	override async pickWorkspaceAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		return this.runEffectToVoid(
			this._pickAndOpenLogic(options, {
				titleKey: "openWorkspaceDefaultTitle",
				defaultTitle: "Open Workspace",
				tauriDirectory: false,
				itemType: "workspace",
				defaultWorkspaceFilter: true,
			}),
		);
	}

	override async showOpenDialog(
		options: IOpenDialogOptions,
	): Promise<URI[] | undefined> {
		return this.runEffectOption(
			this._showOpenDialogLogic(options).pipe(
				Effect.map(Option.getOrElse(() => [] as URI[])),
			),
		);
	}

	override async showSaveDialog(
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		return this.runEffectOption(this._showSaveDialogLogic(options));
	}

	// --- Other Protected Methods ---
	protected override async showUnsupportedBrowserWarning(
		context: "open" | "save",
	): Promise<undefined> {
		await Effect.runPromise(
			effectTauriMessageDialog(
				`The requested file operation (${context}) might not be fully optimal in this environment.`,
				{ title: "Notice", kind: "warning" },
			),
		);
		return undefined;
	}

	protected override shouldUseSimplified(schema: string): boolean {
		if (
			schema === Schemas.file ||
			schema === Schemas.vscodeUserData ||
			schema === Schemas.tmp
		) {
			return false;
		}
		try {
			return super.shouldUseSimplified(schema);
		} catch {
			return true;
		}
	}

	private _effectFromSuperPromise<T, Args extends any[]>(
		methodName: string,
		superFn: (...args: Args) => Promise<T | undefined>,
	): (
		...args: Args
	) => Effect.Effect<Option.Option<T>, SuperCallError, HostService> {
		// Assuming HostService if super might use it, else never
		return (...args: Args) =>
			pipe(
				Effect.tryPromise({
					try: () => superFn.apply(this, args),
					catch: (e) =>
						new SuperCallError({ method: methodName, cause: e }),
				}),
				Effect.map(Option.fromNullable),
			);
	}

	protected override async pickFileToSaveSimplified(
		schema: string,
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		if (schema === Schemas.file) {
			return this.runEffectOption(
				this._showSaveDialogLogic({
					...options,
					title: options.title ?? localize("saveAsTitle", "Save As"),
				}),
			);
		}
		return this.runEffectOption(
			this._effectFromSuperPromise(
				"pickFileToSaveSimplified",
				super.pickFileToSaveSimplified,
			)(schema, options),
		);
	}

	protected override async pickFileAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
		remote: boolean,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.runEffectToVoid(
				this._pickAndOpenLogic(options, {
					titleKey: "openFileDefaultTitle",
					defaultTitle: "Open File",
					tauriDirectory: false,
					itemType: "file",
				}),
			);
		}
		return this.runEffectToVoid(
			this._effectFromSuperPromise(
				"pickFileAndOpenSimplified",
				super.pickFileAndOpenSimplified,
			)(schema, options, remote),
		);
	}

	protected override async pickFolderAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.runEffectToVoid(
				this._pickAndOpenLogic(options, {
					titleKey: "openFolderDefaultTitle",
					defaultTitle: "Open Folder",
					tauriDirectory: true,
					itemType: "folder",
				}),
			);
		}
		return this.runEffectToVoid(
			this._effectFromSuperPromise(
				"pickFolderAndOpenSimplified",
				super.pickFolderAndOpenSimplified,
			)(schema, options),
		);
	}

	protected override async pickWorkspaceAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			return this.runEffectToVoid(
				this._pickAndOpenLogic(options, {
					titleKey: "openWorkspaceDefaultTitle",
					defaultTitle: "Open Workspace",
					tauriDirectory: false,
					itemType: "workspace",
					defaultWorkspaceFilter: true,
				}),
			);
		}
		return this.runEffectToVoid(
			this._effectFromSuperPromise(
				"pickWorkspaceAndOpenSimplified",
				super.pickWorkspaceAndOpenSimplified,
			)(schema, options),
		);
	}
}
