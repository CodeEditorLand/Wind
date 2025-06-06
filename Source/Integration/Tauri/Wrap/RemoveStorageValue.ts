import { invoke } from "@tauri-apps/api/tauri";
import type { StorageScope } from "vs/platform/storage/common/storage";

import { FromAsync } from "../../../Effect/Produce.js";
import { StorageProblem } from "../Error.js";

interface RemoveValueParams {
	scope: StorageScope;
	key: string;
}

const CreateProblem = (cause: unknown): StorageProblem =>
	new StorageProblem({ cause, operation: "remove" });

const Remove = (params: RemoveValueParams) =>
	FromAsync(
		() => invoke<void>("mountain_storage_remove_value", params),
		CreateProblem,
		{ operation: "remove" },
	)();

export default Remove;
