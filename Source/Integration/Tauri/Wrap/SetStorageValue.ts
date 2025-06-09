/*
 * File: Wind/Source/Integration/Tauri/Wrap/SetStorageValue.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:12 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/tauri
 */

import { invoke } from "@tauri-apps/api/tauri";
import type {
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage";

import { FromAsync } from "../../../Effect/Produce.js";
import { StorageProblem } from "../Error.js";

interface SetValueParams {
	scope: StorageScope;
	key: string;
	value: unknown;
	target: StorageTarget;
}

const CreateProblem = (cause: unknown): StorageProblem =>
	new StorageProblem({ cause, operation: "set" });

const Set = (params: SetValueParams) =>
	FromAsync(
		() => invoke<void>("mountain_storage_set_value", params),
		CreateProblem,
		{ operation: "set" },
	)();

export default Set;
