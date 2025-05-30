import {
	documentDir as tauriDocumentDirApi,
	homeDir as tauriHomeDirApi,
} from "@tauri-apps/api/path";
import {
	message as tauriMessageDialogApi,
	open as tauriOpenDialogApi,
	save as tauriSaveDialogApi,
	type DialogFilter as TauriDialogFilter,
	type OpenDialogOptions as TauriOpenDialogOptions,
	type SaveDialogOptions as TauriSaveDialogOptions,
} from "@tauri-apps/plugin-dialog";
import { Context, Data, Effect, Option, pipe } from "effect";
import { Schemas } from "vs/base/common/network";
import { URI } from "vs/base/common/uri";
import type { FileFilter } from "vs/platform/dialogs/common/dialogs";
import type {
	IFileToOpen,
	IFolderToOpen,
	IOpenWindowOptions,
	IWorkspaceToOpen,
} from "vs/platform/window/common/window";

// VSCode specific types

import {
	makeEffectFromPromise,
	makeEffectFromServiceMethod,
	makeEffectOptionFromPromise,
} from "../Effect.js";

// Adjust path as needed

// --- Custom Error Definitions ---
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

export class OpenWindowError extends Data.TaggedError("OpenWindowError")<{
	readonly cause: unknown;
	readonly operation: "hostServiceOpenWindow";
}> {
	constructor(props: { cause: unknown; operation: "hostServiceOpenWindow" }) {
		super(props);
	}
}

export class SuperCallError extends Data.TaggedError("SuperCallError")<{
	readonly method: string;
	readonly cause: unknown;
}> {
	constructor(props: { cause: unknown; method: string }) {
		super(props);
	}
}

// --- Service Definition for HostService ---
// This should mirror the actual IHostService interface you use.
export interface IHostService {
	openWindow(
		toOpen: ReadonlyArray<IFolderToOpen | IFileToOpen | IWorkspaceToOpen>,
		options?: IOpenWindowOptions,
	): Promise<void>;
	// Add other methods if your service uses them and they need wrapping
}
// Tag for HostService using Effect.Context
export class HostService extends Context.Tag("app/HostService")<
	HostService,
	IHostService
>() {}

// --- Generated Tauri API Effect Wrappers ---
const tauriPathError =
	(operation: "homeDir" | "documentDir") => (cause: unknown) =>
		new TauriPathError({ cause, operation });

const tauriDialogError =
	(operation: "open" | "save" | "message") => (cause: unknown) =>
		new TauriDialogError({ cause, operation });

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

// tauriOpenDialog returns Promise<string | string[] | null>
export const effectTauriOpenDialog = makeEffectOptionFromPromise(
	tauriOpenDialogApi as (
		options: TauriOpenDialogOptions,
	) => Promise<string | string[] | null>,
	tauriDialogError("open"),
	{ operation: "open" },
);

// tauriSaveDialog returns Promise<string | null>
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

// --- Generated HostService Interaction Effect ---
export const effectOpenInHostService = makeEffectFromServiceMethod(
	HostService,
	"openWindow",
	(cause: unknown) =>
		new OpenWindowError({ cause, operation: "hostServiceOpenWindow" }),
	{ operation: "hostServiceOpenWindow" },
);

// --- Path Conversion and Logic Helpers ---

/**
 * Purely converts a VSCode URI to a Tauri path string if it's a file URI.
 */
export function uriToTauriPathOption(uri?: URI): Option.Option<string> {
	return pipe(
		Option.fromNullable(uri),
		Option.filter((u: { scheme: string }) => u.scheme === Schemas.file),
		Option.map((u: { fsPath: any }) => u.fsPath),
	);
}

/**
 * Effectfully determines a default path for Tauri dialogs by trying homeDir then documentDir.
 */
export const effectGetFallbackDefaultPath: Effect.Effect<
	Option.Option<string>,
	TauriPathError
> = pipe(
	effectTauriHomeDir,
	Effect.map(Option.some), // If homeDir succeeds, wrap in Some
	Effect.catchTag(
		"TauriPathError",
		(
			e: { operation: string }, // If homeDir fails with TauriPathError
		) =>
			e.operation === "homeDir" // Check if it's specifically the homeDir operation that failed
				? pipe(
						effectTauriDocumentDir, // Try documentDir
						Effect.map(Option.some), // If documentDir succeeds, wrap in Some
						Effect.catchTag(
							"TauriPathError",
							(
								e2: { operation: string }, // If documentDir also fails with TauriPathError
							) =>
								e2.operation === "documentDir"
									? Effect.succeed(Option.none()) // Both known fallbacks failed, succeed with None
									: Effect.fail(e2), // Unexpected TauriPathError from documentDir (should not happen if factories are specific)
						),
					)
				: Effect.fail(e), // Propagate if error was not from homeDir operation (should not happen)
	),
);

/**
 * Effectfully gets a dialog's default path.
 * Tries `optionsDefaultUri` first, then `effectGetFallbackDefaultPath`.
 */
export function effectGetFinalDefaultPath(
	optionsDefaultUri?: URI,
): Effect.Effect<Option.Option<string>, TauriPathError> {
	return pipe(
		uriToTauriPathOption(optionsDefaultUri),
		Option.match({
			onSome: (p: any) => Effect.succeed(Option.some(p)),
			onNone: () => effectGetFallbackDefaultPath,
		}),
	);
}

/**
 * Purely converts VSCode FileFilters to TauriDialogFilters.
 */
export function vscodeFiltersToTauriFiltersOption(
	vscodeFilters?: readonly FileFilter[],
): Option.Option<TauriDialogFilter[]> {
	return pipe(
		Option.fromNullable(vscodeFilters),
		Option.filter((filters: string | any[]) => filters.length > 0),
		Option.map((filters: FileFilter[]) =>
			filters.map((f: FileFilter) => ({
				name: f.name,
				extensions: [...f.extensions],
			})),
		),
	);
}

// --- Dialog Result Processing Helpers ---

export function processTauriOpenResultToSingleUriOption(
	selectedOption: Option.Option<string | string[]>,
): Option.Option<URI> {
	return pipe(
		selectedOption,
		Option.filter(
			(s: string | any[]): s is string =>
				typeof s === "string" && s.length > 0,
		),
		Option.map(URI.file),
	);
}

export function processTauriOpenResultToUriArrayOption(
	selectedOption: Option.Option<string | string[]>,
): Option.Option<URI[]> {
	return pipe(
		selectedOption,
		Option.map((s: any) => (Array.isArray(s) ? s : [s])),
		Option.filter(
			(paths: any[]) =>
				paths.length > 0 &&
				paths.every(
					(p: string | any[]) =>
						typeof p === "string" && p.length > 0,
				),
		),
		Option.map((paths: string[]) => paths.map(URI.file)),
	);
}

export function processTauriSaveResultToUriOption(
	selectedPathOption: Option.Option<string>,
): Option.Option<URI> {
	return pipe(
		selectedPathOption,
		Option.map(URI.file), // No need to filter for non-empty string, Option.fromNullable in factory handles null
	);
}

// --- URI Object Factories ---
export const makeFolderToOpen = (uri: URI): IFolderToOpen => ({
	folderUri: uri,
});
export const makeFileToOpen = (uri: URI): IFileToOpen => ({ fileUri: uri });
export const makeWorkspaceToOpen = (uri: URI): IWorkspaceToOpen => ({
	workspaceUri: uri,
});
