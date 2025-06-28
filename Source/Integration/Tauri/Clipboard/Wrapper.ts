/**
 * @module Wrapper (Integration/Tauri/Clipboard)
 * @description Provides declarative `Effect` wrappers for Tauri's clipboard plugin.
 */

import { Effect } from "effect";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { Uri } from "Source/Platform/VSCode/Type.js";
import { IntegrationClipboardProblem } from "./Error.js";

/** An Effect that reads text from the system clipboard. */
export const ReadText = Effect.tryPromise({
	try: () => readText(),
	catch: (Cause) =>
		new IntegrationClipboardProblem({ Cause, Operation: "ReadText" }),
});

/** An Effect that writes text to the system clipboard. */
export const WriteText = (
	Text: string,
): Effect.Effect<void, IntegrationClipboardProblem> =>
	Effect.tryPromise({
		try: () => writeText(Text),
		catch: (Cause) =>
			new IntegrationClipboardProblem({ Cause, Operation: "WriteText" }),
	});

// --- Stubs for other clipboard operations ---
// A full implementation would wrap the corresponding Tauri APIs.

export const ReadImage = Effect.fail(
	new IntegrationClipboardProblem({
		Cause: "NotImplemented",
		Operation: "ReadImage",
	}),
);

export const WriteImage = (
	_Image: Uint8Array,
): Effect.Effect<void, IntegrationClipboardProblem> =>
	Effect.fail(
		new IntegrationClipboardProblem({
			Cause: "NotImplemented",
			Operation: "WriteImage",
		}),
	);

export const ReadResourceList = Effect.succeed([] as Uri[]);

export const WriteResourceList = (
	_Resources: Uri[],
): Effect.Effect<void, IntegrationClipboardProblem> => Effect.void;

export const HasResourceList = Effect.succeed(false);
