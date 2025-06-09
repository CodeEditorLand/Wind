/*
 * File: Wind/Source/Integration/Configuration/Wrap/ReadRawFile.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:19 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ../Error.js, @tauri-apps/api/fs, effect
 */

import { readTextFile } from "@tauri-apps/api/fs";
import { Effect } from "effect";

import type { Uri } from "../../../Platform/VSCode/Type.js";
import { FileSystemProblem } from "../Error.js";

const ReadRawFile = (FileUri: Uri): Effect.Effect<string, FileSystemProblem> =>
	Effect.tryPromise({
		try: () => readTextFile(FileUri.fsPath),
		catch: (cause) =>
			new FileSystemProblem({ cause, path: FileUri.fsPath }),
	});

export default ReadRawFile;
