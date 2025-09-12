/**
 * @module Action
 * @description
 * This module provides declarative `Effect` wrappers for Tauri's clipboard plugin.
 * Each export is a self-contained Effect that performs a single clipboard action.
 */

import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Effect } from "effect";

import type { Uri } from "../../../../Platform/Vscode/Type.js";
import { TauriClipboardProblem } from "./Problem.js";

/**
 * An Effect that reads text from the system clipboard. Fails with a
 * `TauriClipboardProblem` if the native operation fails.
 */
export const ReadText = Effect.tryPromise({
	try: () => readText(),
	catch: (Cause) =>
		new TauriClipboardProblem({ Cause, Operation: "ReadText" }),
});

/**
 * An Effect that writes text to the system clipboard. Fails with a
 * `TauriClipboardProblem` if the native operation fails.
 * @param Text The string to write to the clipboard.
 */
export const WriteText = (
	Text: string,
): Effect.Effect<void, TauriClipboardProblem> =>
	Effect.tryPromise({
		try: () => writeText(Text),
		catch: (Cause) =>
			new TauriClipboardProblem({ Cause, Operation: "WriteText" }),
	});

// --- Stubs for other clipboard operations ---

export const ReadImage = Effect.fail(
	new TauriClipboardProblem({
		Cause: "NotImplemented",
		Operation: "ReadImage",
	}),
);

export const WriteImage = (
	_Image: Uint8Array,
): Effect.Effect<void, TauriClipboardProblem> =>
	Effect.fail(
		new TauriClipboardProblem({
			Cause: "NotImplemented",
			Operation: "WriteImage",
		}),
	);

export const ReadResourceList = Effect.succeed([] as Uri[]);

export const WriteResourceList = (
	_Resources: Uri[],
): Effect.Effect<void, TauriClipboardProblem> => Effect.void;

export const HasResourceList = Effect.succeed(false);
