// Application/Dialog/Definition.ts
// Purpose: Defines the concrete implementation object of the IFileDialogService.

import { Effect, Option, pipe, Runtime } from "effect";
import { localize } from "vs/nls";
import {
	ConfirmResult,
	type IFileDialogService as FileDialog, // Using our exported type from Tag.ts or VSCode
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	ProvideHost,
	UriConstructor,
	type UriType,
} from "../../Integration/Tauri.js"; // Main aggregator

// Placeholder for the actual HostServiceLive layer or a similar mechanism to provide dependencies
// In a real app, this would be a fully configured Layer.
import { HostServiceLivePlaceholder } from "./_HostServicePlaceholder.js"; // TODO: Create this placeholder or real one
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Types.js"; // Error types for this service

// Pure helper for options, previously in this file. Could also be in Factory/
const _getAbstractPickFileToSaveOptions = (
	path: UriType,
	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,
	title: localize("saveAsTitle", "Save As"),
});

// --- Runtime specific to this service module instance ---
// This runtime is configured with necessary services (like HostService)
// In a real app, this runtime might be part of a larger application runtime.
// For a true singleton module replacing VSCode's DI, this runtime and its layer
// configuration are key to how dependencies are injected when Effects are run.
const ServiceRuntime = Runtime.make(HostServiceLivePlaceholder); // Provide the HostService layer

/**
 * @module Definition (Service Definition)
 * @description The concrete implementation object for the IFileDialogService.
 * Methods adapt Effects to the Promise-based interface using a configured Runtime.
 */
const Definition: FileDialog = {
	_serviceBrand: undefined,

	_run: <A, E extends ServiceProblem>(
		eff: Effect.Effect<A, E, ProvideHost>,
	) => {
		// ProvideHost is the R type for many effects
		return Runtime.runPromise(ServiceRuntime)(eff); // Use the pre-configured ServiceRuntime
	},
	_runOption: <A, E extends ServiceProblem>(
		eff: Effect.Effect<Option.Option<A>, E, ProvideHost>,
	) => {
		return Definition._run(eff.pipe(Effect.map(Option.getOrUndefined)));
	},
	_runVoid: <E extends ServiceProblem>(
		eff: Effect.Effect<any, E, ProvideHost>,
	) => {
		return Definition._run(Effect.void(eff));
	},

	pickFileFolderAndOpen: (options: VsCodePickOptions) =>
		Definition._runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileOrFolderDefaultTitle",
				defaultTitle: "Open File or Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		),
	pickFileAndOpen: (options: VsCodePickOptions) =>
		Definition._runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
				tauriDirectory: false,
				itemType: "file",
			}),
		),
	pickFolderAndOpen: (options: VsCodePickOptions) =>
		Definition._runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFolderDefaultTitle",
				defaultTitle: "Open Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		),
	pickWorkspaceAndOpen: (options: VsCodePickOptions) =>
		Definition._runVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openWorkspaceDefaultTitle",
				defaultTitle: "Open Workspace",
				tauriDirectory: false,
				itemType: "workspace",
				defaultWorkspaceFilter: true,
			}),
		),

	pickFileToSave: (path: UriType, fileSystems?: string[]) =>
		Definition._run(
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
		Definition._runOption(Orchestrate.PerformShowSave(options)),
	showOpenDialog: (options: VsCodeOpenOptions) =>
		Definition._run(
			// Returns Promise<UriType[] | undefined>
			Orchestrate.PerformShowOpen(options).pipe(
				Effect.map(Option.getOrElse(() => [] as UriType[])),
			),
		),

	defaultFilePath: (filter?: string) =>
		Definition._run(
			Effect.succeed(
				UriConstructor.file(`/mock/file/${filter || "default"}`),
			),
		),
	defaultFolderPath: (filter?: string) =>
		Definition._run(
			Effect.succeed(
				UriConstructor.file(`/mock/folder/${filter || "default"}`),
			),
		),
	defaultWorkspacePath: (filter?: string) =>
		Definition._run(
			Effect.succeed(
				UriConstructor.file(`/mock/workspace/${filter || "default"}`),
			),
		),
	preferredHome: (filter?: string) =>
		Definition._run(
			Effect.succeed(
				UriConstructor.file(`/mock/home/${filter || "default"}`),
			),
		),
	showSaveConfirm: (filesOrResources: (string | UriType)[]) =>
		Definition._run(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
