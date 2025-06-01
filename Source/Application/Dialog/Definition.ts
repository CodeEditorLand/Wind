// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

import { Effect, Layer, Option, Runtime, Scope } from "effect"; // Added Scope
import { localize } from "vs/nls";
import {
	ConfirmResult,
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

// We don't need to import PerformAction here if HostServiceRequirement is typeof HostServiceTag

import {
	UriConstructor,
	type Uri as UriType,
} from "../../Integration/Tauri.js";
// Import the Tag itself, not the service interface type alias from here
import HostServiceTag from "../../Platform/VSCode/Provide/Host.js";
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js"; // This provides Layer for HostServiceTag
import * as Orchestrate from "./Orchestration.js"; // Orchestration effects
import type { ServiceProblem } from "./Type.js";

// --- Runtime specific to this service module instance ---

// HostServiceLivePlaceholder is a Layer that provides HostServiceTag
const fileDialogServiceDependenciesLayer = HostServiceLivePlaceholder;

// Layer.toRuntime creates an Effect that yields a Runtime.
// The Runtime's context (R in Runtime<R>) will be the Tag itself (typeof HostServiceTag)
// if the layer is defined as Layer<typeof HostServiceTag, ...>.
const runtimeEffect: Effect.Effect<
	Runtime.Runtime<typeof HostServiceTag>,
	never,
	Scope.Scope
> = Layer.toRuntime(fileDialogServiceDependenciesLayer);

// Execute the effect to get the Runtime instance.
// Effect.scoped provides the Scope needed by Layer.toRuntime.
const ServiceRuntime: Runtime.Runtime<typeof HostServiceTag> = Effect.runSync(
	Effect.scoped(runtimeEffect),
);

// The requirement for effects that depend on the host service is the Tag itself.
type HostServiceRequirement = typeof HostServiceTag;

/**
 * Helper function to run an Effect that yields a value, using the service-specific runtime.
 * @param eff The Effect to run. It may require HostServiceRequirement.
 * @returns A Promise resolving with the Effect's success value.
 */
function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, HostServiceRequirement>, // Effect requires the Tag
): Promise<A> {
	return Runtime.runPromise(ServiceRuntime, eff);
}

/**
 * Helper function to run an Effect that yields an Option, unwrapping it to T | undefined.
 * @param eff The Effect yielding an Option to run.
 * @returns A Promise resolving to the Option's value or undefined.
 */
function _runOption<A, E extends ServiceProblem>(
	eff: Effect.Effect<Option.Option<A>, E, HostServiceRequirement>,
): Promise<A | undefined> {
	return Runtime.runPromise(
		ServiceRuntime,
		eff.pipe(Effect.map(Option.getOrUndefined)),
	);
}

/**
 * Helper function to run an Effect that yields void (for side effects).
 * @param eff The void-yielding Effect to run.
 * @returns A Promise resolving when the Effect completes.
 */
function _runVoid<E extends ServiceProblem>(
	eff: Effect.Effect<void, E, HostServiceRequirement>,
): Promise<void> {
	return Runtime.runPromise(ServiceRuntime, eff);
}

/**
 * Gets options for a "pick file to save" dialog.
 * @param path The default URI for saving.
 * @param _fileSystems Optional array of file system schemes.
 * @returns VSCode save dialog options.
 */
const _getAbstractPickFileToSaveOptions = (
	path: UriType,
	_fileSystems?: string[], // Often for remote file systems, unused in basic shim
): VsCodeSaveOptions => ({
	defaultUri: path,
	title: localize("saveAsTitle", "Save As"),
});

/**
 * The concrete implementation of VSCode's IFileDialogService.
 */
const Definition: FileDialog = {
	_serviceBrand: undefined, // Required by VSCode service interfaces

	pickFileFolderAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			// Orchestrate.PerformPickAndOpen now returns Effect<..., ..., typeof HostServiceTag>
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileOrFolderDefaultTitle",
				defaultTitle: "Open File or Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		),

	pickFileAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
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
				tauriDirectory: false,
				itemType: "workspace",
				defaultWorkspaceFilter: true,
			}),
		),

	pickFileToSave: (defaultUri: UriType, availableFileSystems?: string[]) =>
		_run(
			// Orchestrate.PerformShowSave has R = never, so this whole effect has R = never
			Effect.succeed(
				_getAbstractPickFileToSaveOptions(
					defaultUri,
					availableFileSystems,
				),
			).pipe(
				Effect.flatMap((configOptions) =>
					Orchestrate.PerformShowSave(configOptions),
				),
				Effect.map(Option.getOrUndefined),
			),
		),

	showSaveDialog: (
		options: VsCodeSaveOptions,
	): Promise<UriType | undefined> =>
		// Orchestrate.PerformShowSave has R = never
		_runOption(Orchestrate.PerformShowSave(options)),

	showOpenDialog: (
		options: VsCodeOpenOptions,
	): Promise<UriType[] | undefined> =>
		// Orchestrate.PerformShowOpen has R = never
		_run(
			Orchestrate.PerformShowOpen(options).pipe(
				Effect.map(Option.getOrElse(() => [] as UriType[])),
				Effect.map((uris) => (uris.length > 0 ? uris : undefined)),
			),
		),

	defaultFilePath: (schemeFilter?: string) =>
		_run(
			// R = never
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-file-path/${schemeFilter || "default"}.txt`,
				),
			),
		),

	defaultFolderPath: (schemeFilter?: string) =>
		_run(
			// R = never
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-folder-path/${schemeFilter || "default"}`,
				),
			),
		),

	defaultWorkspacePath: (schemeFilter?: string) =>
		_run(
			// R = never
			Effect.succeed(
				UriConstructor.file(
					`/mock/default-workspace-path/${schemeFilter || "default"}.code-workspace`,
				),
			),
		),

	preferredHome: (schemeFilter?: string) =>
		_run(
			// R = never
			Effect.succeed(
				UriConstructor.file(
					`/mock/preferred-home/${schemeFilter || "default"}`,
				),
			),
		),

	showSaveConfirm: (
		_filesOrResources: (string | UriType)[],
	): Promise<ConfirmResult> => _run(Effect.succeed(ConfirmResult.SAVE)), // R = never
};

export default Definition;
