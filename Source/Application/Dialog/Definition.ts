// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

// Removed unused Context TS6133
import { Effect, Layer, Option, pipe, Runtime } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	// VSCode Interface
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	// Use ActualHostServiceTag TS6133 for HostServiceTag
	HostServiceTag as ActualHostServiceTag,
	UriConstructor,
	type Uri as UriType,
	// Unused TS6133
	// Scheme as VsCodeScheme,
	// Unused TS6133
	// ConvertOpenResultToSingleUri,
	// Unused TS6133
	// ConvertOpenResultToUriArray,
	// Unused TS6133
	// ConvertSaveResultToUri,
	// Unused TS6133
	// RequestOpenDialog,
	// Unused TS6133
	// RequestSaveDialog,
} from "../../Integration/Tauri.js";
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";

// Unused TS6133
// import DialogServiceTag from "./Tag.js";

// --- Runtime specific to this service module instance ---
const ServiceRuntimeContext = Effect.runSync(
	// Layer.build returns Effect<Context, E, R_Layer_Build>
	Layer.build(HostServiceLivePlaceholder),
);

// Runtime.make expects a Context, not an Effect that produces a Context.
// So, ServiceRuntimeContext IS the context.
const ServiceRuntime = Runtime.make(ServiceRuntimeContext);

const runEffect = Runtime.runPromise(ServiceRuntime);

// Helper functions (not part of IFileDialogService interface but internal to this module)
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
	// The effect should already be Effect<void,...>.
	// Runtime.runPromise will handle the void.
	return runEffect(eff);
}

// Pure helper for options
const _getAbstractPickFileToSaveOptions = (
	path: UriType,

	// prefixed unused
	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,

	title: localize("saveAsTitle", "Save As"),
});

const Definition: FileDialog = {
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (
		options: VsCodePickOptions,

		// Explicit return type
	): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileOrFolderDefaultTitle",

				defaultTitle: "Open File or Folder",

				tauriDirectory: true,

				itemType: "folder",
			}),
		),

	pickFileAndOpen: (
		options: VsCodePickOptions,

		// Explicit return type
	): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileDefaultTitle",

				defaultTitle: "Open File",

				tauriDirectory: false,

				itemType: "file",
			}),
		),

	pickFolderAndOpen: (
		options: VsCodePickOptions,

		// Explicit return type
	): Promise<void> =>
		_runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFolderDefaultTitle",

				defaultTitle: "Open Folder",

				tauriDirectory: true,

				itemType: "folder",
			}),
		),

	pickWorkspaceAndOpen: (
		options: VsCodePickOptions,

		// Explicit return type
	): Promise<void> =>
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

	showSaveConfirm: (
		// Prefixed unused TS6133
		_filesOrResources: (string | UriType)[],
	) => _run(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
