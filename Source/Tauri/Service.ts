import { Effect, Layer, Option, pipe } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	IFileDialogService,
	type IOpenDialogOptions,
	type IPickAndOpenOptions,
	type ISaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	HostServiceTag, // Dependency Tag
	Schemas,
	SuperCallError, // For super calls
	URI,
	type FileDialogServiceError, // Specific error type for this service
} from "../Effect/Tauri.js";
// Using aggregated imports

// Logic Implementations
import { pickAndOpenLogicImpl } from "./LogicImpl/PickAndOpen.js";
import { showOpenDialogLogicImpl } from "./LogicImpl/ShowOpenDialog.js";
import { showSaveDialogLogicImpl } from "./LogicImpl/ShowSaveDialog.js";

// --- Placeholder for AbstractFileDialogService logic extraction ---
// This function would ideally be an Effect requiring its own set of VSCode service dependencies.
const _getPickFileToSaveDialogOptionsFromAbstract = (
	defaultUri: URI,
	_availableFileSystems?: string[],
): ISaveDialogOptions /* This would be Effect<ISaveDialogOptions, SomeError, DepTags> */ => {
	return {
		defaultUri,
		title: localize("saveAsTitle", "Save As"),
		// More complex logic from AbstractFileDialogService would go here,
		// potentially requiring IConfigurationService, etc.
	};
};

// --- The Service Object Implementation ---
// This object implements IFileDialogService. Its methods return Effects that declare dependencies in R.
export const TauriFileDialogServiceImpl: IFileDialogService = {
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (options) =>
		pickAndOpenLogicImpl(options, {
			titleKey: "openFileOrFolderDefaultTitle",
			defaultTitle: "Open File or Folder",
			tauriDirectory: true,
			itemType: "folder",
		}),
	pickFileAndOpen: (options) =>
		pickAndOpenLogicImpl(options, {
			titleKey: "openFileDefaultTitle",
			defaultTitle: "Open File",
			tauriDirectory: false,
			itemType: "file",
		}),
	pickFolderAndOpen: (options) =>
		pickAndOpenLogicImpl(options, {
			titleKey: "openFolderDefaultTitle",
			defaultTitle: "Open Folder",
			tauriDirectory: true,
			itemType: "folder",
		}),
	pickWorkspaceAndOpen: (options) =>
		pickAndOpenLogicImpl(options, {
			titleKey: "openWorkspaceDefaultTitle",
			defaultTitle: "Open Workspace",
			tauriDirectory: false,
			itemType: "workspace",
			defaultWorkspaceFilter: true,
		}),

	pickFileToSave: (defaultUri, availableFileSystems) =>
		pipe(
			// Simulate effectful acquisition of dialog options if getPickFileToSaveDialogOptionsFromAbstract was effectful
			Effect.succeed(
				_getPickFileToSaveDialogOptionsFromAbstract(
					defaultUri,
					availableFileSystems,
				),
			),
			Effect.flatMap((dialogOptions) =>
				showSaveDialogLogicImpl(dialogOptions),
			), // Already returns Effect<Option<URI>>
			Effect.map(Option.getOrUndefined), // Converts Option<URI> to URI | undefined
		),

	showSaveDialog: (options) =>
		showSaveDialogLogicImpl(options).pipe(
			Effect.map(Option.getOrUndefined),
		),
	showOpenDialog: (options) =>
		showOpenDialogLogicImpl(options).pipe(
			Effect.map(Option.getOrElse(() => [] as URI[])),
		),

	// --- Abstract methods - Placeholder Effects ---
	// These would require full Effect-based implementations and their respective dependencies.
	defaultFilePath: (_schemeFilter?: string) =>
		Effect.succeed(URI.file("/mocked/defaultFilePathFromService")),
	defaultFolderPath: (_schemeFilter?: string) =>
		Effect.succeed(URI.file("/mocked/defaultFolderPathFromService")),
	defaultWorkspacePath: (_schemeFilter?: string) =>
		Effect.succeed(URI.file("/mocked/defaultWorkspacePathFromService")),
	preferredHome: (_schemeFilter?: string) =>
		Effect.succeed(URI.file("/mocked/preferredHomeFromService")),
	showSaveConfirm: (_fileNamesOrResources: (string | URI)[]) =>
		Effect.succeed(ConfirmResult.SAVE),
};

// --- Layer for Providing the FileDialogService ---
// This Layer makes TauriFileDialogServiceImpl available via the IFileDialogService Tag.
// It doesn't list HostServiceTag etc. as *its own direct* dependencies for construction,
// because the methods of TauriFileDialogServiceImpl *return Effects that require* these services.
// The actual dependencies are resolved when those returned Effects are run.
export const TauriFileDialogServiceLive = Layer.succeed(
	IFileDialogService, // Use the VSCode interface as the Tag
	TauriFileDialogServiceImpl,
);
