// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

import { Context, Effect, Layer, Option, pipe, Runtime, Scope } from "effect";
// VSCode's localization function
import { localize } from "vs/nls";
import {
	ConfirmResult,
	// VSCode's interface
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	// The Tag for HostService dependency
	HostServiceTag as ActualHostServiceTag,
	UriConstructor,
	type Uri as UriType,
} from "../../Integration/Tauri.js";
// Tauri integration utilities
// Mock HostService layer
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
// Core dialog logic effects
import * as Orchestrate from "./Orchestration.js";
// Custom error types for this service
import type { ServiceProblem } from "./Type.js";

// --- Runtime specific to this service module instance ---

// This layer provides the HostService needed by some orchestration effects.
// In a real application, this would likely be part of a larger application layer.
const fileDialogServiceDependenciesLayer: Layer.Layer<
	// Provides HostService
	Context.Tag.Service<typeof ActualHostServiceTag>,
	// No error during layer construction
	never,
	// No requirements for this layer itself
	never
> = HostServiceLivePlaceholder;

/**
 * Creates a runtime environment specifically for the dialog service operations.
 * This runtime includes the necessary dependencies, like the HostService (currently mocked).
 * `Layer.toRuntime` converts a layer into an Effect that, when run, produces a Runtime.
 * `Effect.scoped` provides the necessary Scope for `toRuntime`.
 * `Effect.runSync` executes this Effect synchronously to get the Runtime instance.
 */
const ServiceRuntime: Runtime.Runtime<
	Context.Tag.Service<typeof ActualHostServiceTag>
> = Effect.runSync(
	Effect.scoped(Layer.toRuntime(fileDialogServiceDependenciesLayer)),
);

// Type alias for the HostService, extracted from the Tag.
type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

/**
 * Helper function to run an Effect that yields a value, using the service-specific runtime.
 * This is used by the public methods of the FileDialog definition.
 * @param eff The Effect to run. It may require HostServiceType.
 * @returns A Promise resolving with the Effect's success value.
 */
function _run<A, E extends ServiceProblem>(
	// Effect requires HostServiceType
	eff: Effect.Effect<A, E, HostServiceType>,
): Promise<A> {
	// The runtime provides HostServiceType
	return ServiceRuntime.runPromise(eff);
}

/**
 * Helper function to run an Effect that yields an Option, unwrapping it to T | undefined.
 * @param eff The Effect yielding an Option to run.
 * @returns A Promise resolving to the Option's value or undefined.
 */
function _runOption<A, E extends ServiceProblem>(
	eff: Effect.Effect<Option.Option<A>, E, HostServiceType>,
): Promise<A | undefined> {
	return ServiceRuntime.runPromise(
		eff.pipe(Effect.map(Option.getOrUndefined)),
	);
}

/**
 * Helper function to run an Effect that yields void (for side effects).
 * @param eff The void-yielding Effect to run.
 * @returns A Promise resolving when the Effect completes.
 */
function _runVoid<E extends ServiceProblem>(
	eff: Effect.Effect<void, E, HostServiceType>,
): Promise<void> {
	return ServiceRuntime.runPromise(eff);
}

/**
 * Gets options for a "pick file to save" dialog. VSCode's abstract file dialog service
 * has this as a separate method, so we replicate its option generation.
 * @param path The default URI for saving.
 * @param _fileSystems Optional array of file system schemes (unused in this basic shim).
 * @returns VSCode save dialog options.
 */
const _getAbstractPickFileToSaveOptions = (
	path: UriType,

	// This parameter is often for remote file systems
	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,

	title: localize("saveAsTitle", "Save As"),

	// other options like 'filters' could be added here if needed
});

/**
 * The concrete implementation of VSCode's IFileDialogService.
 */
const Definition: FileDialog = {
	// Required by VSCode service interfaces
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				// Localization key
				titleKey: "openFileOrFolderDefaultTitle",

				// Fallback title
				defaultTitle: "Open File or Folder",

				// Tauri's 'directory' flag allows folder selection
				tauriDirectory: true,

				// Intended item type (though Tauri's dialog is less specific)
				itemType: "folder",
			}),
		),

	pickFileAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileDefaultTitle",

				defaultTitle: "Open File",

				// False for file picking
				tauriDirectory: false,

				itemType: "file",
			}),
		),

	pickFolderAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFolderDefaultTitle",

				defaultTitle: "Open Folder",

				tauriDirectory: true,

				itemType: "folder",
			}),
		),

	pickWorkspaceAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openWorkspaceDefaultTitle",

				defaultTitle: "Open Workspace",

				// Workspaces are files
				tauriDirectory: false,

				itemType: "workspace",

				// Apply .code-workspace filter
				defaultWorkspaceFilter: true,
			}),
		),

	pickFileToSave: (defaultUri: UriType, availableFileSystems?: string[]) =>
		_run(
			Effect.succeed(
				// Start with the options generation
				_getAbstractPickFileToSaveOptions(
					defaultUri,

					availableFileSystems,
				),
			).pipe(
				// Then, pass these options to the save dialog orchestration
				Effect.flatMap((configOptions) =>
					Orchestrate.PerformShowSave(configOptions),
				),

				// Unwrap the Option<UriType> to UriType | undefined
				Effect.map(Option.getOrUndefined),
			),
		),

	showSaveDialog: (
		options: VsCodeSaveOptions,
	): Promise<UriType | undefined> =>
		_runOption(Orchestrate.PerformShowSave(options)),

	showOpenDialog: (
		options: VsCodeOpenOptions,
	): Promise<UriType[] | undefined> =>
		_run(
			// showOpenDialog in VSCode returns Uri[] or undefined, not Option<Uri[]>
			Orchestrate.PerformShowOpen(options).pipe(
				// Convert Option<UriType[]> to UriType[] or undefined (empty array if None)
				Effect.map(Option.getOrElse(() => [] as UriType[])),

				// VSCode returns undefined if nothing selected
				Effect.map((uris) => (uris.length > 0 ? uris : undefined)),
			),
		),

	// These default path methods are often used by VSCode to pre-fill dialogs.
	// Here, they return mock paths. A real implementation might use ResolveFinalDefaultPath
	// or other Tauri path APIs.
	defaultFilePath: (
		// schemeFilter often 'user' or 'tmp'
		schemeFilter?: string,
	) =>
		_run(
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-file-path/${schemeFilter || "default"}.txt`,
				),
			),
		),

	defaultFolderPath: (schemeFilter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-folder-path/${schemeFilter || "default"}`,
				),
			),
		),

	defaultWorkspacePath: (schemeFilter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-workspace-path/${schemeFilter || "default"}.code-workspace`,
				),
			),
		),

	preferredHome: (schemeFilter?: string) =>
		// This should ideally resolve to the user's actual home directory or a preferred default.
		// For now, it's a mock.
		_run(
			Effect.succeed(
				UriConstructor.file(
					`/mock/preferred-home/${schemeFilter || "default"}`,
				),
			),
		),

	// showSaveConfirm is used before overwriting files.
	// This mock always confirms to save. A real implementation might show a Tauri message dialog.
	showSaveConfirm: (
		filesOrResources: (string | UriType)[],

		// Other options: DONT_SAVE, CANCEL
	): Promise<ConfirmResult> => _run(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
