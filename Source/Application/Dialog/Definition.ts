/*
 * File: Wind/Source/Application/Dialog/Definition.ts
 * Role: Provides the live implementation of the `IFileDialogService`.
 * Responsibilities:
 *   - Implements the methods for showing file open and save dialogs.
 *   - Orchestrates the dialog logic, deciding whether to use a simplified
 *     HTML-based dialog or to call out to the native host (`Mountain`).
 *   - Uses the `HostService` to invoke native dialogs via the Tauri IPC bridge.
 */

import { Effect, Option, Runtime } from "effect";
import { localize } from "vs/nls";
import type { IConfigurationService } from "vs/platform/configuration/common/configuration.js";
import {
	type IFileDialogService,
	type IOpenDialogOptions,
	type ISaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs.js";

import { Uri } from "../../../Platform/VSCode/Type.js";
import { Tag as ConfigurationTag } from "../Configuration/mod.js";
import { HostService } from "../Host/mod.js";
import type { ServiceProblem } from "./Error/mod.js";
import { DecideUseSimplified } from "./Utility/mod.js";

// --- Internal Effect Constructors ---

const CreateShowOpenDialogEffect = (
	Host: HostService["Type"],

	ConfigService: IConfigurationService,

	Options: IOpenDialogOptions,
): Effect.Effect<readonly Uri[] | undefined, ServiceProblem> => {
	const ShouldUseSimplified = DecideUseSimplified(
		ConfigService,

		Options.defaultUri,
	);

	if (ShouldUseSimplified) {
		// A real implementation would call an HTML-based dialog effect here.
		return Effect.dieMessage(
			"Simplified 'showOpenDialog' is not implemented.",
		);
	}

	// Orchestrate the call to the native dialog via the HostService.
	return Host.showOpenDialog(Options).pipe(
		Effect.map(Option.getOrElse(() => [] as readonly Uri[])),

		// Return undefined if no files were selected
		Effect.map((Uris) => (Uris.length > 0 ? Uris : undefined)),
	);
};

const CreateShowSaveDialogEffect = (
	Host: HostService["Type"],

	ConfigService: IConfigurationService,

	Options: ISaveDialogOptions,
): Effect.Effect<Uri | undefined, ServiceProblem> => {
	const ShouldUseSimplified = DecideUseSimplified(
		ConfigService,

		Options.defaultUri,
	);

	if (ShouldUseSimplified) {
		return Effect.dieMessage(
			"Simplified 'showSaveDialog' is not implemented.",
		);
	}

	return Host.showSaveDialog(Options).pipe(Effect.map(Option.getOrUndefined));
};

// --- Main Service Definition ---

/**
 * An Effect that builds the live implementation of the Dialog service.
 */
const Definition = Effect.gen(function* (_) {
	const ConfigurationService = yield* _(ConfigurationTag);

	const Host = yield* _(HostService.Tag);

	const AppRuntime = yield* _(Effect.runtime<never>());

	const RunPromise = Runtime.runPromise(AppRuntime);

	const Service: IFileDialogService = {
		_serviceBrand: undefined,

		// Each method builds and runs the corresponding Effect workflow.
		showOpenDialog: (options) =>
			RunPromise(
				CreateShowOpenDialogEffect(Host, ConfigurationService, options),
			),

		showSaveDialog: (options) =>
			RunPromise(
				CreateShowSaveDialogEffect(Host, ConfigurationService, options),
			),

		pickFileToSave: (defaultUri, availableFileSystems) =>
			RunPromise(
				CreateShowSaveDialogEffect(Host, ConfigurationService, {
					defaultUri,

					title: localize("saveAsFile", "Save File"),

					availableFileSystems,
				}),
			),

		showSaveConfirm: (files) => RunPromise(Host.showSaveConfirm(files)),

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
