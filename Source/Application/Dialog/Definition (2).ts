// THIS FILE IS NOW DEPRECATED AND REPLACED BY `Source/workbench/services/dialogs/browser/fileDialogService.ts`
// You may remove this file from your source tree. It's provided here for historical context of the refactoring.
import { Effect, Layer, Option, Runtime, Scope } from "effect";
import { localize } from "vs/nls";
import { IConfigurationService } from "vs/platform/configuration/common/configuration.js";
import {
	ConfirmResult,
	type IFileDialogService as FileDialog,
	type IOpenDialogOptions as VsCodeOpenOptions,
	type IPickAndOpenOptions as VsCodePickOptions,
	type ISaveDialogOptions as VsCodeSaveOptions,
} from "vs/platform/dialogs/common/dialogs";

import {
	LiveHostService,
	type Host as HostServiceRequirement,
} from "../../Application/Host.js";
import { type Uri as UriType } from "../../Integration/Tauri.js";
import * as Orchestrate from "./Orchestration.js";
import type { ServiceProblem } from "./Type.js";
import { DecideSimplified } from "./Utility.js";

const fileDialogServiceDependenciesLayer = LiveHostService;

const runtimeEffect: Effect.Effect<
	Runtime.Runtime<HostServiceRequirement>,
	never,
	Scope.Scope
> = Layer.toRuntime(fileDialogServiceDependenciesLayer);

const ServiceRuntime: Runtime.Runtime<HostServiceRequirement> = Effect.runSync(
	Effect.scoped(runtimeEffect),
);

function _run<A, E extends ServiceProblem>(
	eff: Effect.Effect<A, E, HostServiceRequirement>,
): Promise<A> {
	return Runtime.runPromise(ServiceRuntime, eff);
}

function _runOption<A, E extends ServiceProblem>(
	eff: Effect.Effect<Option.Option<A>, E, HostServiceRequirement>,
): Promise<A | undefined> {
	return Runtime.runPromise(
		ServiceRuntime,
		eff.pipe(Effect.map(Option.getOrUndefined)),
	);
}

function _runVoid<E extends ServiceProblem>(
	eff: Effect.Effect<void, E, HostServiceRequirement>,
): Promise<void> {
	return Runtime.runPromise(ServiceRuntime, eff);
}

// Helper to get the `files.simpleDialog.enable` setting.
// This would ideally come from an injected ConfigurationService effect.
// For now, we mock it.
const getSimpleDialogSetting = (
	configService: IConfigurationService,
): boolean => {
	try {
		return configService.getValue("files.simpleDialog.enable") === true;
	} catch {
		return false;
	}
};

const getScheme = (options: {
	availableFileSystems?: readonly string[];
	defaultUri?: UriType;
}): string => {
	// This logic needs access to IPathService to be complete.
	// For now, we simplify.
	return (
		(options.availableFileSystems && options.availableFileSystems[0]) ||
		options.defaultUri?.scheme ||
		"file"
	);
};

const Definition: FileDialog = {
	_serviceBrand: undefined,

	pickFileFolderAndOpen: (options: VsCodePickOptions) =>
		_runVoid(
			Effect.gen(function* (_) {
				// This effect requires IConfigurationService.
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					// Placeholder for simplified dialog logic
					return yield* _(
						Effect.die(
							"Simplified 'pickFileFolderAndOpen' not implemented yet.",
						),
					);
				}

				return yield* _(
					Orchestrate.PerformPickAndOpen(options, "fileOrFolder"),
				);
			}),
		),

	pickFileAndOpen: (options: VsCodePickOptions) =>
		_runVoid(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'pickFileAndOpen' not implemented yet.",
						),
					);
				}

				return yield* _(
					Orchestrate.PerformPickAndOpen(options, "file"),
				);
			}),
		),

	pickFolderAndOpen: (options: VsCodePickOptions) =>
		_runVoid(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'pickFolderAndOpen' not implemented yet.",
						),
					);
				}

				return yield* _(
					Orchestrate.PerformPickAndOpen(options, "folder"),
				);
			}),
		),

	pickWorkspaceAndOpen: (options: VsCodePickOptions) =>
		_runVoid(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'pickWorkspaceAndOpen' not implemented yet.",
						),
					);
				}
				return yield* _(
					Orchestrate.PerformPickAndOpen(options, "workspace"),
				);
			}),
		),

	pickFileToSave: (defaultUri: UriType, availableFileSystems?: string[]) =>
		_runOption(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme({ defaultUri, availableFileSystems }),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'pickFileToSave' not implemented yet.",
						),
					);
				}

				// This needs to be a full orchestration effect.
				const saveOptions: VsCodeSaveOptions = {
					defaultUri,
					availableFileSystems,
					title: localize("saveAsTitle", "Save As"),
				};
				return yield* _(Orchestrate.PerformShowSave(saveOptions));
			}),
		),

	showSaveDialog: (options: VsCodeSaveOptions) =>
		_runOption(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'showSaveDialog' not implemented yet.",
						),
					);
				}
				return yield* _(Orchestrate.PerformShowSave(options));
			}),
		),

	showOpenDialog: (options: VsCodeOpenOptions) =>
		_run(
			Effect.gen(function* (_) {
				const configService = yield* _(
					Effect.context<IConfigurationService>(),
				);
				const useSimplified = DecideSimplified(
					getScheme(options),
					getSimpleDialogSetting(configService),
				);

				if (useSimplified) {
					return yield* _(
						Effect.die(
							"Simplified 'showOpenDialog' not implemented yet.",
						),
					);
				}

				const result = yield* _(Orchestrate.PerformShowOpen(options));
				return Option.getOrElse(result, () => [] as UriType[]);
			}).pipe(Effect.map((uris) => (uris.length > 0 ? uris : undefined))),
		),

	showSaveConfirm: (filesOrResources: (string | UriType)[]) =>
		_run(Orchestrate.PerformSaveConfirm(filesOrResources)),

	defaultFilePath: (schemeFilter?: string) =>
		_run(
			Effect.die(
				"defaultFilePath requires IHistoryService and IPathService. Not implemented yet.",
			),
		),

	defaultFolderPath: (schemeFilter?: string) =>
		_run(
			Effect.die(
				"defaultFolderPath requires IHistoryService and IPathService. Not implemented yet.",
			),
		),

	defaultWorkspacePath: (schemeFilter?: string) =>
		_run(
			Effect.die(
				"defaultWorkspacePath requires IWorkspaceContextService, IHistoryService, and IPathService. Not implemented yet.",
			),
		),

	preferredHome: (schemeFilter?: string) =>
		_run(
			Effect.die(
				"preferredHome requires IConfigurationService and IPathService. Not implemented yet.",
			),
		),
};

export default Definition;
