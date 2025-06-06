import { invoke } from "@tauri-apps/api/tauri";

import { FromAsync } from "../../../Effect/Produce.js";
import type { Uri } from "../../../Platform/VSCode/Type.js";
import { FileSystemProblem } from "../Error.js";

const CreateProblem = (cause: unknown) =>
	new FileSystemProblem({ cause, operation: "readFile" });

const ReadFile = (resource: Uri) =>
	FromAsync(
		() => invoke<Uint8Array>("fs_read_file", { uri: resource.toString() }),
		CreateProblem,
		{ operation: "readFile" },
	)();

export default ReadFile;
