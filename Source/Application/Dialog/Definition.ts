// Application/Dialog/Definition.ts

import { Effect, Layer, Option, pipe, Runtime } from "effect"; // Added Runtime
import { localize } from "vs/nls";
import {
	ConfirmResult,
	IFileDialogService,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	ProvideHost, // This is the Tag for HostService (PerformHostAction interface)
	Uri, // Import both value and type
	UriType,
	// ... other necessary imports from Integration/Tauri
} from "../../Integration/Tauri.js";
import * as Orchestrate from "./Orchestration.js"; // Import all orchestrated logic
import type { ServiceProblem } from "./Types.js";

// Assuming HostServiceLive is a Layer<HostServiceTag, HostServiceError, HostServiceDeps>
// This would be defined elsewhere, e.g. Platform/VSCode/Provide/HostLive.ts
const HostServiceLivePlaceholder = Layer.succeed(ProvideHost, {
	// Placeholder implementation
	openWindow: () =>
		Promise.resolve(console.log("Mock HostService.openWindow called")),
});

const _getAbstractPickFileToSaveOptions = (
	path: UriType,
	_fileSystems?: string[],
): VsCodeSaveOptions => ({
	defaultUri: path,
	title: localize("saveAsTitle", "Save As"),
});

/**
 * @module Definition (Service Definition)
 * @description The concrete implementation object for the IFileDialogService.
 * Methods here will adapt Effects to the Promise-based interface.
 */
const Definition: IFileDialogService = {
	_serviceBrand: undefined,

	// Each method now needs to create a Runtime or use a pre-existing one
	// to run its respective Effect and return a Promise.
	// For a true singleton service, the Runtime would be created once.
	// Let's assume a helper to run these for now.
	// The R (requirements) of these effects (like ProvideHost) must be satisfied.

	_runEffect: <A, E extends ServiceProblem>(
		eff: Effect.Effect<A, E, ProvideHost>,
	) => {
		// This is a simplified runner. In a real app, this Runtime would be part of the application's core.
		// It needs to be configured with all necessary layers (e.g., HostServiceLive).
		const runnable = Effect.provide(eff, HostServiceLivePlaceholder); // Provide necessary layers
		return Runtime.runPromise(Runtime.defaultRuntime)(runnable); // Use default runtime for simplicity here
	},
	_runEffectOption: <A, E extends ServiceProblem>(
		eff: Effect.Effect<Option.Option<A>, E, ProvideHost>,
	) => {
		return Definition._runEffect(
			eff.pipe(Effect.map(Option.getOrUndefined)),
		);
	},
	_runEffectVoid: <E extends ServiceProblem>(
		eff: Effect.Effect<any, E, ProvideHost>,
	) => {
		return Definition._runEffect(Effect.void(eff));
	},

	pickFileFolderAndOpen: (options: VsCodePickOptions): Promise<void> => {
		return Definition._runEffectVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileOrFolderDefaultTitle",
				defaultTitle: "Open File or Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		);
	},
	pickFileAndOpen: (options: VsCodePickOptions): Promise<void> => {
		return Definition._runEffectVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
				tauriDirectory: false,
				itemType: "file",
			}),
		);
	},
	pickFolderAndOpen: (options: VsCodePickOptions): Promise<void> => {
		return Definition._runEffectVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openFolderDefaultTitle",
				defaultTitle: "Open Folder",
				tauriDirectory: true,
				itemType: "folder",
			}),
		);
	},
	pickWorkspaceAndOpen: (options: VsCodePickOptions): Promise<void> => {
		return Definition._runEffectVoid(
			Orchestrate.PerformPickAndOpen(options, {
				titleKey: "openWorkspaceDefaultTitle",
				defaultTitle: "Open Workspace",
				tauriDirectory: false,
				itemType: "workspace",
				defaultWorkspaceFilter: true,
			}),
		);
	},

	pickFileToSave: (
		path: UriType,
		fileSystems?: string[],
	): Promise<UriType | undefined> => {
		const effect = pipe(
			Effect.succeed(
				_getAbstractPickFileToSaveOptions(path, fileSystems),
			), // Pure
			Effect.flatMap((configOptions) =>
				Orchestrate.PerformShowSave(configOptions),
			),
			Effect.map(Option.getOrUndefined),
		);
		return Definition._runEffect(effect);
	},

	showSaveDialog: (
		options: VsCodeSaveOptions,
	): Promise<UriType | undefined> => {
		return Definition._runEffectOption(
			Orchestrate.PerformShowSave(options),
		);
	},
	showOpenDialog: (
		options: VsCodeOpenOptions,
	): Promise<UriType[] | undefined> => {
		const effect = Orchestrate.PerformShowOpen(options).pipe(
			Effect.map(Option.getOrElse(() => [] as UriType[])),
		);
		return Definition._runEffect(effect); // This will resolve to URI[] or throw if effect fails
	},

	// --- Abstract methods - Must also return Promises ---
	defaultFilePath: (_filter?: string): Promise<UriType> =>
		Definition._runEffect(Effect.succeed(Uri.file("/mock/file/path"))),
	defaultFolderPath: (_filter?: string): Promise<UriType> =>
		Definition._runEffect(Effect.succeed(Uri.file("/mock/folder/path"))),
	defaultWorkspacePath: (_filter?: string): Promise<UriType> =>
		Definition._runEffect(Effect.succeed(Uri.file("/mock/workspace/path"))),
	preferredHome: (_filter?: string): Promise<UriType> =>
		Definition._runEffect(Effect.succeed(Uri.file("/mock/home/path"))),
	showSaveConfirm: (
		_filesOrResources: (string | UriType)[],
	): Promise<ConfirmResult> =>
		Definition._runEffect(Effect.succeed(ConfirmResult.SAVE)),
};

export default Definition;
