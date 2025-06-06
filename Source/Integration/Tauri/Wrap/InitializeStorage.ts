import { invoke } from "@tauri-apps/api/tauri";
import { StorageScope } from "vs/platform/storage/common/storage";

import { FromAsync } from "../../../Effect/Produce.js";
import { StorageProblem } from "../Error.js"; // New error type

interface InitialStorageData {
	application: Map<string, string>;
	profile: Map<string, string>;
	workspace: Map<string, string>;
}

const CreateProblem = (cause: unknown): StorageProblem =>
	new StorageProblem({ cause, operation: "initialize" });

const Fetch = FromAsync(
	() => invoke<InitialStorageData>("mountain_storage_initialize"),
	CreateProblem,
	{ operation: "initialize" },
);

export default Fetch;
