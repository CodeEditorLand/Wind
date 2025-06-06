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
