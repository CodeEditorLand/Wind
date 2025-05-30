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
// Assuming these VSCode imports are available in your project structure
import { URI } from "vs/base/common/uri";
import type { FileFilter } from "vs/platform/dialogs/common/dialogs";
import type {
	IFileToOpen,
	IFolderToOpen,
	IOpenWindowOptions,
	IWorkspaceToOpen,
} from "vs/platform/window/common/window";

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
export interface IHostService {
	openWindow(
		toOpen: ReadonlyArray<IFolderToOpen | IFileToOpen | IWorkspaceToOpen>,
		options?: IOpenWindowOptions,
	): Promise<void>;
}
export class HostService extends Context.Tag("app/HostService")<
	HostService,
	IHostService
>() {}

// --- Error Factory Curried Functions for Conciseness ---
const tauriPathErrorFactory =
	(operation: "homeDir" | "documentDir") =>
	(cause: unknown): TauriPathError =>
		new TauriPathError({ cause, operation });

const tauriDialogErrorFactory =
	(operation: "open" | "save" | "message") =>
	(cause: unknown): TauriDialogError =>
		new TauriDialogError({ cause, operation });

// --- Generated Tauri API Effect Wrappers ---
export const effectTauriHomeDir = makeEffectFromPromise(
	tauriHomeDirApi,
	tauriPathErrorFactory("homeDir"),
	{ operation: "homeDir" },
);

export const effectTauriDocumentDir = makeEffectFromPromise(
	tauriDocumentDirApi,
	tauriPathErrorFactory("documentDir"),
	{ operation: "documentDir" },
);

export const effectTauriOpenDialog = makeEffectOptionFromPromise(
	tauriOpenDialogApi as (
		options: TauriOpenDialogOptions,
	) => Promise<string | string[] | null>,
	tauriDialogErrorFactory("open"),
	{ operation: "open" },
);

export const effectTauriSaveDialog = makeEffectOptionFromPromise(
	tauriSaveDialogApi as (
		options: TauriSaveDialogOptions,
	) => Promise<string | null>,
	tauriDialogErrorFactory("save"),
	{ operation: "save" },
);

export const effectTauriMessageDialog = makeEffectFromPromise(
	tauriMessageDialogApi as (
		message: string,
		options?:
			| string
			| { title?: string; kind?: "info" | "warning" | "error" },
	) => Promise<void>,
	tauriDialogErrorFactory("message"),
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
export function uriToTauriPathOption(uri?: URI): Option.Option<string> {
	return pipe(
		Option.fromNullable(uri),
		Option.filter((u) => u.scheme === Schemas.file),
		Option.map((u) => u.fsPath),
	);
}

export const effectGetFallbackDefaultPath: Effect.Effect<
	Option.Option<string>,
	TauriPathError
> = pipe(
	effectTauriHomeDir,
	Effect.map(Option.some),
	Effect.catchTag("TauriPathError", (e) =>
		e.operation === "homeDir"
			? pipe(
					effectTauriDocumentDir,
					Effect.map(Option.some),
					Effect.catchTag("TauriPathError", (e2) =>
						e2.operation === "documentDir"
							? Effect.succeed(Option.none<string>())
							: Effect.fail(e2),
					),
				)
			: Effect.fail(e),
	),
);

export function effectGetFinalDefaultPath(
	optionsDefaultUri?: URI,
): Effect.Effect<Option.Option<string>, TauriPathError> {
	return pipe(
		uriToTauriPathOption(optionsDefaultUri),
		Option.match({
			onSome: (p) => Effect.succeed(Option.some(p)),
			onNone: () => effectGetFallbackDefaultPath,
		}),
	);
}

export function vscodeFiltersToTauriFiltersOption(
	vscodeFilters?: readonly FileFilter[],
): Option.Option<TauriDialogFilter[]> {
	return pipe(
		Option.fromNullable(vscodeFilters),
		Option.filter((filters) => filters.length > 0),
		Option.map((filters) =>
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
			(s): s is string => typeof s === "string" && s.length > 0,
		),
		Option.map(URI.file),
	);
}

export function processTauriOpenResultToUriArrayOption(
	selectedOption: Option.Option<string | string[]>,
): Option.Option<URI[]> {
	return pipe(
		selectedOption,
		Option.map((s) => (Array.isArray(s) ? s : [s])),
		Option.filter(
			(paths) =>
				paths.length > 0 &&
				paths.every((p) => typeof p === "string" && p.length > 0),
		),
		Option.map((paths) => paths.map(URI.file)),
	);
}

export function processTauriSaveResultToUriOption(
	selectedPathOption: Option.Option<string>,
): Option.Option<URI> {
	return pipe(
		selectedPathOption,
		Option.filter((s): s is string => s.length > 0),
		Option.map(URI.file),
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
