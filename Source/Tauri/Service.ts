import type {
	OpenDialogOptions as TauriOpenDialogOptions,
	SaveDialogOptions as TauriSaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { Effect, Option } from "effect";
// Assuming these VSCode imports are correct relative to your project structure
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

// Import helpers and error types from our new file
import {
	effectGetFinalDefaultPath,
	effectOpenInHostService,
	effectTauriMessageDialog,
	effectTauriOpenDialog,
	effectTauriSaveDialog,
	HostService, // The Effect Tag
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

// Combined error types for this service's operations
type DialogOperationError = TauriPathError | TauriDialogError;

type PickAndOpenServiceError = DialogOperationError | OpenWindowError;

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

	// Helper to run effects and provide HostService context
	private runEffect<A, E>(
		effect: Effect.Effect<A, E, HostService>,
	): Promise<A> {
		return Effect.runPromise(
			Effect.provideService(effect, HostService, this.effectHostService),
		);
	}

	private runEffectOption<A, E>(
		effect: Effect.Effect<Option.Option<A>, E, HostService>,
	): Promise<A | undefined> {
		return this.runEffect(effect.pipe(Effect.map(Option.getOrUndefined)));
	}

	private runEffectToVoid<E>(
		effect: Effect.Effect<any, E, HostService>,
	): Promise<void> {
		return this.runEffect(Effect.void(effect));
	}

	// --- Internal Effect-based Logic ---

	private _pickAndOpenLogic(
		options: IPickAndOpenOptions,
		dialogConfig: {
			titleKey: string; // For localization or default title
			defaultTitle: string;

			tauriDirectory: boolean;

			itemType: "file" | "folder" | "workspace";

			defaultWorkspaceFilter?: boolean;
		},
	): Effect.Effect<void, PickAndOpenServiceError, HostService> {
		return Effect.gen(function* ($) {
			const specificOptions = options as IPickAndOpenOptions &
				Partial<IOpenDialogOptions>;

			const defaultPathOption = yield* $(
				effectGetFinalDefaultPath(specificOptions.defaultUri),
			);

			const tauriDialogOpts: TauriOpenDialogOptions = {
				title:
					specificOptions.title ||
					localize(dialogConfig.titleKey, dialogConfig.defaultTitle),
				multiple: false,
				directory: dialogConfig.tauriDirectory,
			};

			Option.tap(defaultPathOption, (dp) =>
				Effect.sync(() => {
					tauriDialogOpts.defaultPath = dp;
				}),
			);

			if (dialogConfig.itemType !== "folder") {
				// Files or Workspaces might have filters
				let tauriFiltersOption = vscodeFiltersToTauriFiltersOption(
					specificOptions.filters,
				);

				if (
					dialogConfig.defaultWorkspaceFilter &&
					Option.isNone(tauriFiltersOption)
				) {
					tauriFiltersOption = Option.some([
						{
							name: "VS Code Workspace",
							extensions: ["code-workspace"],
						},
					]);
				}
				Option.tap(tauriFiltersOption, (filters) =>
					Effect.sync(() => {
						tauriDialogOpts.filters = filters;
					}),
				);
			}

			const selectedOption = yield* $(
				effectTauriOpenDialog(tauriDialogOpts),
			);

			const selectedUriOption =
				processTauriOpenResultToSingleUriOption(selectedOption);

			yield* $(
				Option.matchEffect(selectedUriOption, {
					onNone: () => Effect.void,
					onSome: (uri) => {
						const openWindowOpts: IOpenWindowOptions = {
							forceNewWindow: options.forceNewWindow ?? false,
						};

						if (
							typeof (options as any).forceReuseWindow ===
							"boolean"
						) {
							openWindowOpts.forceReuseWindow = (
								options as any
							).forceReuseWindow;
						}
						if (options.remoteAuthority !== undefined) {
							openWindowOpts.remoteAuthority =
								options.remoteAuthority;
						}

						let itemToOpen:
							| IFolderToOpen
							| IFileToOpen
							| IWorkspaceToOpen;

						if (dialogConfig.itemType === "folder")
							itemToOpen = makeFolderToOpen(uri);
						else if (dialogConfig.itemType === "file")
							itemToOpen = makeFileToOpen(uri);
						else itemToOpen = makeWorkspaceToOpen(uri); // workspace

						return effectOpenInHostService(
							[itemToOpen],
							openWindowOpts,
						);
					},
				}),
			);
		});
	}

	private _showOpenDialogLogic(
		options: IOpenDialogOptions,
	): Effect.Effect<Option.Option<URI[]>, DialogOperationError, HostService> {
		return Effect.gen(function* ($) {
			const defaultPathOption = yield* $(
				effectGetFinalDefaultPath(options.defaultUri),
			);

			const tauriOptions: TauriOpenDialogOptions = {
				title: options.title || localize("open", "Open"),
				multiple: !!options.canSelectMany,
				directory: false, // Default to files
			};

			Option.tap(defaultPathOption, (dp) =>
				Effect.sync(() => {
					tauriOptions.defaultPath = dp;
				}),
			);

			Option.tap(
				vscodeFiltersToTauriFiltersOption(options.filters),
				(filters) =>
					Effect.sync(() => {
						tauriOptions.filters = filters;
					}),
			);

			if (options.canSelectFolders) {
				tauriOptions.directory = true;

				if (options.canSelectFiles) {
					// Tauri cannot select both files and folders. Prioritizing folders.
					// Log a warning if necessary.
					yield* $(
						Effect.logWarning(
							"Tauri 'open' dialog cannot select both files and folders. Prioritizing folders.",
						),
					);
				}
			}
			// If only canSelectFiles is true, directory remains false (default).

			const selectedOption = yield* $(
				effectTauriOpenDialog(tauriOptions),
			);

			return processTauriOpenResultToUriArrayOption(selectedOption);
		});
	}

	private _showSaveDialogLogic(
		options: ISaveDialogOptions,
	): Effect.Effect<Option.Option<URI>, DialogOperationError, HostService> {
		return Effect.gen(function* ($) {
			const tauriOptions: TauriSaveDialogOptions = {
				title: options.title || localize("saveAsTitle", "Save As"),
			};

			Option.tap(
				yield* $(effectGetFinalDefaultPath(options.defaultUri)),
				(dp) =>
					Effect.sync(() => {
						tauriOptions.defaultPath = dp;
					}),
			);

			Option.tap(
				vscodeFiltersToTauriFiltersOption(options.filters),
				(filters) =>
					Effect.sync(() => {
						tauriOptions.filters = filters;
					}),
			);

			return processTauriSaveResultToUriOption(
				yield* $(effectTauriSaveDialog(tauriOptions)),
			);
		});
	}

	// --- Public IFileDialogService Methods ---

	public override async pickFileToSave(
		defaultUri: URI,
		availableFileSystems?: string[],
	): Promise<URI | undefined> {
		const options: ISaveDialogOptions = this.getPickFileToSaveDialogOptions(
			defaultUri,
			availableFileSystems,
		);

		if (options.title === undefined) {
			options.title = localize("saveAsTitle", "Save As");
		}
		const effect = this._showSaveDialogLogic(options);

		return this.runEffectOption(effect);
	}

	override async pickFileFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		// Defaulting to folder selection logic for this ambiguous VSCode method name
		const logicEffect = this._pickAndOpenLogic(options, {
			titleKey: "openFileOrFolderDefaultTitle", // Example localization key
			defaultTitle: "Open File or Folder",
			tauriDirectory: true,
			itemType: "folder",
		});

		return this.runEffectToVoid(logicEffect);
	}

	override async pickFileAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const logicEffect = this._pickAndOpenLogic(options, {
			titleKey: "openFileDefaultTitle",
			defaultTitle: "Open File",
			tauriDirectory: false,
			itemType: "file",
		});

		return this.runEffectToVoid(logicEffect);
	}

	override async pickFolderAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const logicEffect = this._pickAndOpenLogic(options, {
			titleKey: "openFolderDefaultTitle",
			defaultTitle: "Open Folder",
			tauriDirectory: true,
			itemType: "folder",
		});

		return this.runEffectToVoid(logicEffect);
	}

	override async pickWorkspaceAndOpen(
		options: IPickAndOpenOptions,
	): Promise<void> {
		const logicEffect = this._pickAndOpenLogic(options, {
			titleKey: "openWorkspaceDefaultTitle",
			defaultTitle: "Open Workspace",
			tauriDirectory: false, // Workspaces are files
			itemType: "workspace",
			defaultWorkspaceFilter: true,
		});

		return this.runEffectToVoid(logicEffect);
	}

	override async showOpenDialog(
		options: IOpenDialogOptions,
	): Promise<URI[] | undefined> {
		const effect = this._showOpenDialogLogic(options);

		// If Option is None, map to undefined; otherwise, map Some<URI[]> to URI[]
		return this.runEffect(effect.pipe(Effect.map(Option.getOrUndefined)));
	}

	override async showSaveDialog(
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		const effect = this._showSaveDialogLogic(options);

		return this.runEffectOption(effect);
	}

	// --- Other Protected Methods ---

	protected override async showUnsupportedBrowserWarning(
		context: "open" | "save",
	): Promise<undefined> {
		const message = `The requested file operation (${context}) might not be fully optimal in this environment.`;

		// This effect does not require HostService from context, so can be run directly
		await Effect.runPromise(
			effectTauriMessageDialog(message, {
				title: "Notice",
				kind: "warning",
			}),
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
		// If AbstractFileDialogService.shouldUseSimplified exists and is meaningful:
		// try {
		//   return super.shouldUseSimplified(schema);

		// } catch {
		//   // Fallback if super method doesn't exist or throws
		//   return true;

		// }
		return true; // Default for non-local schemes
	}

	private effectFromSuperPromise<T, Args extends any[]>(
		methodName: string,
		superFn: (...args: Args) => Promise<T>,
	): (...args: Args) => Effect.Effect<T, SuperCallError, HostService> {
		return (...args: Args) =>
			Effect.tryPromise({
				try: () => superFn.apply(this, args), // Ensure 'this' context is correct for super call
				catch: (e) =>
					new SuperCallError({ method: methodName, cause: e }),
			});
	}

	protected override async pickFileToSaveSimplified(
		schema: string,
		options: ISaveDialogOptions,
	): Promise<URI | undefined> {
		if (schema === Schemas.file) {
			const effect = this._showSaveDialogLogic({
				...options,
				title: options.title ?? localize("saveAsTitle", "Save As"),
			});

			return this.runEffectOption(effect);
		}
		const superCallEffect = this.effectFromSuperPromise(
			"pickFileToSaveSimplified",
			super.pickFileToSaveSimplified,
		)(schema, options);

		return this.runEffectOption(
			superCallEffect.pipe(Effect.map(Option.fromNullable)),
		); // Super might return undefined directly
	}

	protected override async pickFileAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
		remote: boolean,
	): Promise<void> {
		if (schema === Schemas.file) {
			const logicEffect = this._pickAndOpenLogic(options, {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
				tauriDirectory: false,
				itemType: "file",
			});

			return this.runEffectToVoid(logicEffect);
		}
		const superCallEffect = this.effectFromSuperPromise(
			"pickFileAndOpenSimplified",
			super.pickFileAndOpenSimplified,
		)(schema, options, remote);

		return this.runEffectToVoid(superCallEffect);
	}

	protected override async pickFolderAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			const logicEffect = this._pickAndOpenLogic(options, {
				titleKey: "openFolderDefaultTitle",
				defaultTitle: "Open Folder",
				tauriDirectory: true,
				itemType: "folder",
			});

			return this.runEffectToVoid(logicEffect);
		}
		const superCallEffect = this.effectFromSuperPromise(
			"pickFolderAndOpenSimplified",
			super.pickFolderAndOpenSimplified,
		)(schema, options);

		return this.runEffectToVoid(superCallEffect);
	}

	protected override async pickWorkspaceAndOpenSimplified(
		schema: string,
		options: IPickAndOpenOptions,
	): Promise<void> {
		if (schema === Schemas.file) {
			const logicEffect = this._pickAndOpenLogic(options, {
				titleKey: "openWorkspaceDefaultTitle",
				defaultTitle: "Open Workspace",
				tauriDirectory: false,
				itemType: "workspace",
				defaultWorkspaceFilter: true,
			});

			return this.runEffectToVoid(logicEffect);
		}
		const superCallEffect = this.effectFromSuperPromise(
			"pickWorkspaceAndOpenSimplified",
			super.pickWorkspaceAndOpenSimplified,
		)(schema, options);

		return this.runEffectToVoid(superCallEffect);
	}
}
