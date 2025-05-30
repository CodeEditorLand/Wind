import {
	documentDir as tauriDocumentDirApi,
	homeDir as tauriHomeDirApi,
} from "@tauri-apps/api/path";
import {
	message as tauriMessageDialogApi,
	open as tauriOpenDialogApi,
	save as tauriSaveDialogApi,
} from "@tauri-apps/plugin-dialog";

import {
	makeEffectFromPromise,
	makeEffectOptionFromPromise,
} from "../../../Effect.js"; // Path to MetaFactory

import {
	TauriDialogError,
	TauriPathError,
	type TauriOpenDialogOptions,
	type TauriSaveDialogOptions,
} from "../CoreTypes.js";

// Curried Error Factories for conciseness
const tauriPathError =
	(operation: "homeDir" | "documentDir") =>
	(cause: unknown): TauriPathError =>
		new TauriPathError({ cause, operation });

const tauriDialogError =
	(operation: "open" | "save" | "message") =>
	(cause: unknown): TauriDialogError =>
		new TauriDialogError({ cause, operation });

// --- Generated Tauri API Effect Wrappers ---
export const effectTauriHomeDir = makeEffectFromPromise(
	tauriHomeDirApi,
	tauriPathError("homeDir"),
	{ operation: "homeDir" },
);

export const effectTauriDocumentDir = makeEffectFromPromise(
	tauriDocumentDirApi,
	tauriPathError("documentDir"),
	{ operation: "documentDir" },
);

export const effectTauriOpenDialog = makeEffectOptionFromPromise(
	tauriOpenDialogApi as (
		options: TauriOpenDialogOptions,
	) => Promise<string | string[] | null>,
	tauriDialogError("open"),
	{ operation: "open" },
);

export const effectTauriSaveDialog = makeEffectOptionFromPromise(
	tauriSaveDialogApi as (
		options: TauriSaveDialogOptions,
	) => Promise<string | null>,
	tauriDialogError("save"),
	{ operation: "save" },
);

export const effectTauriMessageDialog = makeEffectFromPromise(
	tauriMessageDialogApi as (
		message: string,
		options?:
			| string
			| { title?: string; kind?: "info" | "warning" | "error" },
	) => Promise<void>,
	tauriDialogError("message"),
	{ operation: "message" },
);
