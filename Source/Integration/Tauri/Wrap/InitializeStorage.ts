/*
 * File: Wind/Source/Integration/Tauri/Wrap/InitializeStorage.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:12 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/tauri, vs/platform/storage/common/storage
 */

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
