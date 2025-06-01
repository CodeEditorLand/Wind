// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

// Added Scope, Context
import { Context, Effect, Layer, Option, pipe, Runtime, Scope } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	HostServiceTag as ActualHostServiceTag,
	UriConstructor,
	type Uri as UriType,
} from "../../Integration/Tauri.js";
// Removed unused imports for TS6133
// import { Scheme as VsCodeScheme } from "../../Integration/Tauri.js";

// import { ConvertOpenResultToSingleUri } from "../../Integration/Tauri.js";

// import { ConvertOpenResultToUriArray } from "../../Integration/Tauri.js";

// import { ConvertSaveResultToUri } from "../../Integration/Tauri.js";

// import { RequestOpenDialog } from "../../Integration/Tauri.js";

// import { RequestSaveDialog } from "../../Integration/Tauri.js";

import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";

// Unused
// import DialogServiceTag from "./Tag.js";

// --- Runtime specific to this service module instance ---
// Layer.build returns an Effect that, when run, produces the Context and a Scope finalizer.
// We need to provide a Scope to run this effect.
const ServiceRuntimeContextEffect: Effect.Effect<
	// The context provided by the layer
	Context.Context<typeof ActualHostServiceTag.Type>,
	// Error type of Layer.build (should be never if placeholder is simple)
	never,
	// Layer.build requires a Scope
	Scope.Scope
> = Layer.build(HostServiceLivePlaceholder);

// To get the Context for Runtime.make, we run the effect that builds the layer.
// This is typically done at application startup. For this module, we can do it here.
const ServiceRuntimeContext: Context.Context<typeof ActualHostServiceTag.Type> =
	Effect.runSync(
		// Provide a global scope for this build
		Effect.provide(ServiceRuntimeContextEffect, Scope.globalScope),
	);

const ServiceRuntime = Runtime.make(ServiceRuntimeContext);

const runEffect = Runtime.runPromise(ServiceRuntime);

function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, typeof ActualHostServiceTag.Type>,
) {
	return runEffect(eff);
}

function _runOption<A, E extends ServiceProblem>(
	eff: Effect.Effect<Option.Option<A>, E, typeof ActualHostServiceTag.Type>,
) {
	return runEffect(eff.pipe(Effect.map(Option.getOrUndefined)));
}

function _runVoid<E extends ServiceProblem>(
	eff: Effect.Effect<void, E, typeof ActualHostServiceTag.Type>,
) {
	// Effect.void() is not needed here, runEffect handles void promises
	return runEffect(eff);
}

const _getAbstractPickFileToSaveOptions = (
	path: UriType,

	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,

	title: localize("saveAsTitle", "Save As"),
});

const Definition: FileDialog = {
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (options: VsCodePickOptions): Promise<void> =>
		_runVoid(
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

	pickFileToSave: (path: UriType, fileSystems?: string[]) =>
		_run(
			pipe(
				Effect.succeed(
					_getAbstractPickFileToSaveOptions(path, fileSystems),
				),

				Effect.flatMap((configOptions) =>
					Orchestrate.PerformShowSave(configOptions),
				),

				Effect.map(Option.getOrUndefined),
			),
		),

	showSaveDialog: (options: VsCodeSaveOptions) =>
		_runOption(Orchestrate.PerformShowSave(options)),

	showOpenDialog: (options: VsCodeOpenOptions) =>
		_run(
			Orchestrate.PerformShowOpen(options).pipe(
				Effect.map(Option.getOrElse(() => [] as UriType[])),
			),
		),

	defaultFilePath: (filter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(`/mock/file/${filter || "default"}`),
			),
		),

	defaultFolderPath: (filter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(`/mock/folder/${filter || "default"}`),
			),
		),

	defaultWorkspacePath: (filter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(`/mock/workspace/${filter || "default"}`),
			),
		),

	preferredHome: (filter?: string) =>
		_run(
			Effect.succeed(
				UriConstructor.file(`/mock/home/${filter || "default"}`),
			),
		),

	showSaveConfirm: (_filesOrResources: (string | UriType)[]) =>
		_run(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
