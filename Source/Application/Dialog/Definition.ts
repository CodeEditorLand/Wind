/**
 * @module Definition (Dialog)
 * @description An implementation of IFileDialogService that orchestrates dialog
 * operations by composing Effects from the Integration and Orchestration layers.
 */

import { Effect, Option } from "effect";
import { localize } from "vs/nls";
import type { IConfigurationService } from "vs/platform/configuration/common/configuration.js";
import {
	type IFileDialogService,
	type IOpenDialogOptions,
	type ISaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs.js";

import { Uri } from "../../../Platform/VSCode/Type.js";

// --- Internal Effect Constructors ---

const CreateShowOpenDialogEffect = (
	ConfigService: IConfigurationService,
	Options: IOpenDialogOptions,
): Effect.Effect<Uri[] | undefined, ServiceProblem> => {
	const shouldUseSimplified = DecideUseSimplified(
		ConfigService,
		Options.defaultUri,
	);
	if (shouldUseSimplified) {
		// A real implementation would call an HTML-based dialog effect here.
		return Effect.dieMessage(
			"Simplified 'showOpenDialog' is not implemented.",
		);
	}

	// Orchestrate the call to the native dialog.
	return Orchestrate.PerformShowOpen(Options).pipe(
		Effect.map(Option.getOrElse(() => [] as Uri[])),
		Effect.map((Uris) => (Uris.length > 0 ? Uris : undefined)), // Return undefined if no files were selected
	);
};

const CreateShowSaveDialogEffect = (
	ConfigService: IConfigurationService,
	Options: ISaveDialogOptions,
): Effect.Effect<Uri | undefined, ServiceProblem> => {
	const shouldUseSimplified = DecideUseSimplified(
		ConfigService,
		Options.defaultUri,
	);
	if (shouldUseSimplified) {
		return Effect.dieMessage(
			"Simplified 'showSaveDialog' is not implemented.",
		);
	}
	return Orchestrate.PerformShowSave(Options).pipe(
		Effect.map(Option.getOrUndefined),
	);
};

// --- Main Service Definition ---

/**
 * An Effect that builds the live implementation of the Dialog service.
 */
const Definition = Effect.gen(function* (_) {
	const ConfigurationService = yield* _(Configuration.Tag);

	const Service: IFileDialogService = {
		_serviceBrand: undefined,

		// Each method builds and runs the corresponding Effect workflow.
		showOpenDialog: (options) =>
			Effect.runPromise(
				CreateShowOpenDialogEffect(ConfigurationService, options),
			),
		showSaveDialog: (options) =>
			Effect.runPromise(
				CreateShowSaveDialogEffect(ConfigurationService, options),
			),

		pickFileToSave: (defaultUri, availableFileSystems) =>
			Effect.runPromise(
				CreateShowSaveDialogEffect(ConfigurationService, {
					defaultUri,
					title: localize("saveAsFile", "Save File"),
					availableFileSystems,
				}),
			),

		showSaveConfirm: (files) =>
			Effect.runPromise(Orchestrate.PerformSaveConfirm(files)),

		// Stubs for other complex methods that require more orchestration.
		pickFileAndOpen: () => Promise.resolve(undefined),
		pickFolderAndOpen: () => Promise.resolve(undefined),
		pickWorkspaceAndOpen: () => Promise.resolve(undefined),
		pickFileFolderAndOpen: () => Promise.resolve(undefined),
		defaultFilePath: () => Promise.resolve(undefined),
		defaultFolderPath: () => Promise.resolve(undefined),
		defaultWorkspacePath: () => Promise.resolve(undefined),
		preferredHome: () => Promise.resolve(undefined),
	};

	return Service;
});

export default Definition;
