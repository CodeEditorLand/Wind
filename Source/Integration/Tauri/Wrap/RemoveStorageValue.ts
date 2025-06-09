/*
 * File: Wind/Source/Integration/Tauri/Wrap/RemoveStorageValue.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:12 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/tauri, vs/platform/storage/common/storage
 */

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
