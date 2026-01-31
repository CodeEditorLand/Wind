/**
 * @module Read
 * @description
 * Defines an Effect for reading a raw text file using Tauri's FS plugin.
 */

import { readTextFile } from "@tauri-apps/plugin-fs";
import { Effect } from "effect";

import type { Uri } from "../../../../Platform/Vscode/Type.js";
import { TauriConfigurationProblem } from "../Configuration/Problem.js";

/**
 * An Effect that reads the content of a file at a given URI as a string.
 * It wraps the `fs.readTextFile` command from the Tauri FS plugin.
 *
 * @param Uri The URI of the file to read.
 * @returns An `Effect` that resolves with the file content as a string, or
 * fails with a `TauriConfigurationProblem`.
 */
export const ReadRawFile = (
	Uri: Uri,
): Effect.Effect<string, TauriConfigurationProblem> =>
	Effect.tryPromise({
		try: () => readTextFile(Uri.fsPath),
		catch: (Cause) =>
			new TauriConfigurationProblem({
				Cause,
				Context: "ReadFileFailed",
			}),
	});
