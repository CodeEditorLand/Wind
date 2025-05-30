import type {
	DialogFilter as TauriPluginDialogFilter,
	OpenDialogOptions as TauriPluginOpenDialogOptions,
	SaveDialogOptions as TauriPluginSaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { Data } from "effect";
import { Schemas as VsCodeSchemas } from "vs/base/common/network";
// VSCode specific type imports - aliased for clarity and to avoid naming collisions
import { URI as VsCodeURI } from "vs/base/common/uri";
import type { FileFilter as VsCodeFileFilter } from "vs/platform/dialogs/common/dialogs";
import type {
	IFileToOpen as VsCodeIFileToOpen,
	IFolderToOpen as VsCodeIFolderToOpen,
	IWorkspaceToOpen as VsCodeIWorkspaceToOpen,
	IOpenWindowOptions as VsCodeOpenWindowOptions,
} from "vs/platform/window/common/window";

// --- Export aliased VSCode and Tauri types for consistent usage within this module ---
export type URI = VsCodeURI;
export const URI = VsCodeURI; // Export the class constructor as well
export const Schemas = VsCodeSchemas;
export type FileFilter = VsCodeFileFilter;
export type IOpenWindowOptions = VsCodeOpenWindowOptions;
export type IFolderToOpen = VsCodeIFolderToOpen;
export type IFileToOpen = VsCodeIFileToOpen;
export type IWorkspaceToOpen = VsCodeIWorkspaceToOpen;

export type TauriDialogFilter = TauriPluginDialogFilter;
export type TauriOpenDialogOptions = TauriPluginOpenDialogOptions;
export type TauriSaveDialogOptions = TauriPluginSaveDialogOptions;

// --- Custom Error Definitions ---
// These errors are specific to operations related to Tauri interactions.
export class TauriPathError extends Data.TaggedError("TauriPathError")<{
	readonly cause: unknown;
	readonly operation: "homeDir" | "documentDir";
}> {
	constructor(props: {
		cause: unknown;
		operation: "homeDir" | "documentDir";
	}) {
		super(props);
	}
}

export class TauriDialogError extends Data.TaggedError("TauriDialogError")<{
	readonly cause: unknown;
	readonly operation: "open" | "save" | "message";
}> {
	constructor(props: {
		cause: unknown;
		operation: "open" | "save" | "message";
	}) {
		super(props);
	}
}

// This error relates to the VSCode HostService, but is closely tied to Tauri dialog outcomes.
export class OpenWindowError extends Data.TaggedError("OpenWindowError")<{
	readonly cause: unknown;
	readonly operation: "hostServiceOpenWindow";
}> {
	constructor(props: { cause: unknown; operation: "hostServiceOpenWindow" }) {
		super(props);
	}
}

// For emulating calls to super methods in AbstractFileDialogService
export class SuperCallError extends Data.TaggedError("SuperCallError")<{
	readonly method: string;
	readonly cause: unknown;
}> {
	constructor(props: { cause: unknown; method: string }) {
		super(props);
	}
}
