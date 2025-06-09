/*
 * File: Wind/Source/Application/Dialog/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:03:39 UTC
 * Dependency: ./Error/DialogProblem.js, ./Factory/CreateSaveOption.js, ./Factory/CreateShowOpenOption.js, ./Tag.js, effect, vs/base/common/uri.js, vs/nls, vs/platform/configuration/common/configuration
 */

// Source/Application/Dialog/Live.ts
import { Effect, Layer, Option } from "effect";
import { URI } from "vs/base/common/uri.js";
import { localize } from "vs/nls";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import {
	ConfirmResult,
	type IOpenDialogOptions,
	type ISaveDialogOptions,
} from "vs/platform/dialogs/common/dialogs.js";

import {
	ConvertOpenResultToUriArray,
	ConvertSaveResultToUri,
	RequestOpenDialog,
	RequestSaveDialog,
} from "../../../Integration/Tauri.js";
import {
	ConfigurationServiceTag, // Dependency
} from "../../Configuration.js";
import type { DialogProblem } from "./Error/DialogProblem.js";
import CreateSaveOption from "./Factory/CreateSaveOption.js";
import CreateShowOpenOption from "./Factory/CreateShowOpenOption.js";
import DialogServiceTag, { type Interface as FileDialog } from "./Tag.js";

// The live implementation of the FileDialog service.
const LiveFileDialogService = Layer.effect(
	DialogServiceTag,
	Effect.gen(function* (_) {
		const ConfigurationService = yield* _(ConfigurationServiceTag);

		const getSimpleDialogSetting = (): boolean => {
			try {
				return (
					ConfigurationService.getValue(
						"files.simpleDialog.enable",
					) === true
				);
			} catch {
				return false;
			}
		};

		const getScheme = (options: { defaultUri?: URI }): string =>
			options.defaultUri?.scheme || "file";

		const showOpenDialog = (
			Options: IOpenDialogOptions,
		): Effect.Effect<URI[] | undefined, DialogProblem> => {
			if (
				DecideSimplified(getScheme(Options), getSimpleDialogSetting())
			) {
				return Effect.dieMessage(
					"Simplified 'showOpenDialog' not implemented yet.",
				);
			}

			// This is now a clean, declarative pipeline
			return ResolveFinalDefaultPath(Options.defaultUri).pipe(
				Effect.map((DefaultPath) =>
					CreateShowOpenOption(Options, DefaultPath),
				),
				Effect.flatMap((TauriOptions) =>
					RequestOpenDialog(TauriOptions),
				),
				Effect.map(ConvertOpenResultToUriArray),
				Effect.map(Option.getOrElse(() => [])),
				Effect.map((Uris) => (Uris.length > 0 ? Uris : undefined)),
			);
		};

		const showSaveDialog = (
			Options: ISaveDialogOptions,
		): Effect.Effect<Option.Option<URI>, DialogProblem> => {
			if (
				DecideSimplified(getScheme(Options), getSimpleDialogSetting())
			) {
				return Effect.dieMessage(
					"Simplified 'showSaveDialog' not implemented yet.",
				);
			}

			return ResolveFinalDefaultPath(Options.defaultUri).pipe(
				Effect.map((DefaultPath) =>
					CreateSaveOption(Options, DefaultPath),
				),
				Effect.flatMap((TauriOptions) =>
					RequestSaveDialog(TauriOptions),
				),
				Effect.map(ConvertSaveResultToUri),
			);
		};

		// Return the implementation object that satisfies the service interface
		const service: FileDialog = {
			_serviceBrand: undefined,
			showOpenDialog: (options) => showOpenDialog(options),
			showSaveDialog: (options) =>
				showSaveDialog(options).pipe(Effect.map(Option.getOrUndefined)),

			// ... other methods implemented as Effect ...
			pickFileAndOpen: (options) => Effect.die("Not implemented"), // Example stub
			pickFolderAndOpen: (options) => Effect.die("Not implemented"),
			pickWorkspaceAndOpen: (options) => Effect.die("Not implemented"),
			pickFileFolderAndOpen: (options) => Effect.die("Not implemented"),
			pickFileToSave: (defaultUri) =>
				showSaveDialog({
					defaultUri,
					title: localize("saveAsFile", "Save File"),
				}),
			showSaveConfirm: (files) => Effect.succeed(ConfirmResult.SAVE), // Simplified
			defaultFilePath: () => Effect.succeed(URI.file("/default.txt")),
			defaultFolderPath: () => Effect.succeed(URI.file("/default")),
			defaultWorkspacePath: () =>
				Effect.succeed(URI.file("/default.code-workspace")),
			preferredHome: () => Effect.succeed(URI.file("/home")),
		};

		return service;
	}),
);

export default LiveFileDialogService;
