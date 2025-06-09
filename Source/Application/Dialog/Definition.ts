/*
 * File: Wind/Source/Application/Dialog/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 23:37:50 UTC
 * Dependency: ../../Platform/VSCode/Provide/Host.js, ./Orchestration.js, ./Type.js, ./_HostServicePlaceholder.js, effect, vs/nls
 */

// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

import { Effect, Layer, Option, Runtime, Scope } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	UriConstructor,
	type Uri as UriType,
} from "../../Integration/Tauri.js";
// Import PerformAction interface for type R, and HostServiceTag for effects that need it
import { type PerformAction } from "../../Platform/VSCode/Provide/Host.js";
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";

// --- Runtime specific to this service module instance ---

// HostServiceLivePlaceholder is a Layer that provides HostServiceTag
// Its inferred type is Layer.Layer<typeof HostServiceTag, never, never>
const fileDialogServiceDependenciesLayer = HostServiceLivePlaceholder;

// Layer.toRuntime creates an Effect that yields a Runtime.
// The Runtime's context (R in Runtime<R>) will be the Tag itself (typeof HostServiceTag).
const runtimeEffect: Effect.Effect<
	Runtime.Runtime<PerformAction>, // R is PerformAction
	never,
	Scope.Scope
> = Layer.toRuntime(fileDialogServiceDependenciesLayer);

// Execute the effect to get the Runtime instance.
const ServiceRuntime: Runtime.Runtime<PerformAction> = Effect.runSync(
	// R is PerformAction
	Effect.scoped(runtimeEffect),
);

// The requirement for effects that depend on the host service is the Tag itself.
type HostServiceRequirement = PerformAction;

/**
 * Helper function to run an Effect that yields a value, using the service-specific runtime.
 * @param eff The Effect to run. It may require HostServiceRequirement (PerformAction).
 * @returns A Promise resolving with the Effect's success value.
 */
function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, HostServiceRequirement>, // Effect requires PerformAction
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

	// Often for remote file systems, unused in basic shim
	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,

	title: localize("saveAsTitle", "Save As"),
});

/**
 * The concrete implementation of VSCode's IFileDialogService.
 */
const Definition: FileDialog = {
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
			// Orchestrate.PerformPickAndOpen returns Effect<..., ..., typeof HostServiceTag>
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
			Effect.succeed(
				_getAbstractPickFileToSaveOptions(
					defaultUri,

					availableFileSystems,
				),
			).pipe(
				// PerformShowSave should have R = never if it doesn't use HostService
				Effect.flatMap((configOptions) =>
					Orchestrate.PerformShowSave(configOptions),
				),

				Effect.map(Option.getOrUndefined),
			),
		),

	showSaveDialog: (
		options: VsCodeSaveOptions,
	): Promise<UriType | undefined> =>
		// R = never
		_runOption(Orchestrate.PerformShowSave(options)),

	showOpenDialog: (
		options: VsCodeOpenOptions,
	): Promise<UriType[] | undefined> =>
		_run(
			Orchestrate.PerformShowOpen(options).pipe(
				// R = never
				Effect.map(Option.getOrElse(() => [] as UriType[])),

				Effect.map((uris) => (uris.length > 0 ? uris : undefined)),
			),
		),

	defaultFilePath: (schemeFilter?: string) =>
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
		_run(
			Effect.succeed(
				UriConstructor.file(
					`/mock/preferred-home/${schemeFilter || "default"}`,
				),
			),
		),

	// TS6133: _filesOrResources is declared but its value is never read.
	// If it's part of an interface you must implement, prefix with underscore.
	showSaveConfirm: (
		_filesOrResources: (string | UriType)[],
	): Promise<ConfirmResult> => _run(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
