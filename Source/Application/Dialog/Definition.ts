// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

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
	// Renamed for clarity if HostServiceTag itself is an export
	HostServiceTag as ActualHostServiceTag,
	UriConstructor,
	type Uri as UriType,
} from "../../Integration/Tauri.js";
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";

// --- Runtime specific to this service module instance ---
// Layer.build returns an Effect that, when run, produces the Context and a Scope finalizer.
// We need to provide a Scope to run this effect.
const ServiceRuntimeContextEffect: Effect.Effect<
	Context.Context<Context.Tag.Service<typeof ActualHostServiceTag>>,
	// Assuming HostServiceLivePlaceholder has no build errors
	never,
	Scope.Scope
> = Layer.build(HostServiceLivePlaceholder);

// To get the Context for Runtime.make, we run the effect that builds the layer.
// Scope.global is the global scope instance.
const ServiceRuntimeContext = Effect.runSync(
	// Use Scope.global
	Effect.provide(ServiceRuntimeContextEffect, Scope.global),
);

// Runtime.make expects Context.Context<any>, and ServiceRuntimeContext is Context.Context<HostServiceType> which is compatible.
const ServiceRuntime = Runtime.make(ServiceRuntimeContext);

const runEffect = Runtime.runPromise(ServiceRuntime);

type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, HostServiceType>,
) {
	return runEffect(eff);
}

function _runOption<A, E extends ServiceProblem>(
	eff: Effect.Effect<Option.Option<A>, E, HostServiceType>,
) {
	return runEffect(eff.pipe(Effect.map(Option.getOrUndefined)));
}

function _runVoid<E extends ServiceProblem>(
	eff: Effect.Effect<void, E, HostServiceType>,
) {
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
