import { Effect, Option } from "effect";
import { localize } from "vs/nls";

import {
	effectTauriMessageDialog,
	HostServiceTag,
	Schemas,
	SuperCallError,
	TauriDialogError,
	type IPickAndOpenOptions,
	type ISaveDialogOptions,
	type URI,
} from "../Effect/Tauri.js";
// Using aggregated imports

// Import logic implementations if simplified pickers directly use them
import { pickAndOpenLogicImpl } from "./LogicImpl/PickAndOpen.js";
import { showSaveDialogLogicImpl } from "./LogicImpl/ShowSaveDialog.js";

// Formerly showUnsupportedBrowserWarning
export const showTauriUnsupportedBrowserWarning = (
	context: "open" | "save",
): Effect.Effect<void, TauriDialogError, never> => {
	// Original VSCode logic was more complex and would require more service tags here.
	// This is the simplified Tauri-specific version.
	return effectTauriMessageDialog(
		`The requested file operation (${context}) might not be fully optimal in this environment.`,
		{ title: "Notice", kind: "warning" },
	);
};

// Formerly shouldUseSimplified
export const shouldUseSimplifiedDialog = (scheme: string): boolean => {
	// If super.shouldUseSimplified had dependencies, this would become an Effect.
	// For now, assuming it's pure or AbstractFileDialogService logic is inlined/refactored.
	return ![Schemas.file, Schemas.vscodeUserData, Schemas.tmp].includes(
		scheme,
	);
};

// --- Simplified Picker Methods as Standalone Effects ---
// These now explicitly decide whether to use Tauri logic or would call a (hypothetical)
// Effect-based "super" call which would require all of AbstractFileDialogService's dependencies.

export const pickFileToSaveSimplified = (
	schema: string,
	options: ISaveDialogOptions,
): Effect.Effect<
	URI | undefined,
	FileDialogServiceError,
	HostServiceTag /* + AbstractLogicDeps */
> => {
	if (!shouldUseSimplifiedDialog(schema)) {
		// If schema is 'file', use our Tauri logic
		return showSaveDialogLogicImpl({
			...options,
			title: options.title ?? localize("saveAsTitle", "Save As"),
		}).pipe(Effect.map(Option.getOrUndefined));
	}
	// Placeholder for what super.pickFileToSaveSimplified(schema, options) would be as an Effect
	return Effect.fail(
		new SuperCallError({
			method: "pickFileToSaveSimplified_Super",
			cause: "Super call for simplified path not implemented in Tauri service for this schema",
		}),
	);
};

export const pickFileAndOpenSimplified = (
	schema: string,
	options: IPickAndOpenOptions,
	_remote: boolean, // remote parameter might be used by a "super" call
): Effect.Effect<
	void,
	FileDialogServiceError,
	HostServiceTag /* + AbstractLogicDeps */
> => {
	if (!shouldUseSimplifiedDialog(schema)) {
		return pickAndOpenLogicImpl(options, {
			titleKey: "openFileDefaultTitle",
			defaultTitle: "Open File",
			tauriDirectory: false,
			itemType: "file",
		});
	}
	return Effect.fail(
		new SuperCallError({
			method: "pickFileAndOpenSimplified_Super",
			cause: "Super call for simplified path not implemented",
		}),
	);
};

export const pickFolderAndOpenSimplified = (
	schema: string,
	options: IPickAndOpenOptions,
): Effect.Effect<
	void,
	FileDialogServiceError,
	HostServiceTag /* + AbstractLogicDeps */
> => {
	if (!shouldUseSimplifiedDialog(schema)) {
		return pickAndOpenLogicImpl(options, {
			titleKey: "openFolderDefaultTitle",
			defaultTitle: "Open Folder",
			tauriDirectory: true,
			itemType: "folder",
		});
	}
	return Effect.fail(
		new SuperCallError({
			method: "pickFolderAndOpenSimplified_Super",
			cause: "Super call for simplified path not implemented",
		}),
	);
};

export const pickWorkspaceAndOpenSimplified = (
	schema: string,
	options: IPickAndOpenOptions,
): Effect.Effect<
	void,
	FileDialogServiceError,
	HostServiceTag /* + AbstractLogicDeps */
> => {
	if (!shouldUseSimplifiedDialog(schema)) {
		return pickAndOpenLogicImpl(options, {
			titleKey: "openWorkspaceDefaultTitle",
			defaultTitle: "Open Workspace",
			tauriDirectory: false,
			itemType: "workspace",
			defaultWorkspaceFilter: true,
		});
	}
	return Effect.fail(
		new SuperCallError({
			method: "pickWorkspaceAndOpenSimplified_Super",
			cause: "Super call for simplified path not implemented",
		}),
	);
};
