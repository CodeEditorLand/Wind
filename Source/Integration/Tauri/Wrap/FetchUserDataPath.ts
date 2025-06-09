/*
 * File: Wind/Source/Integration/Tauri/Wrap/FetchUserDataPath.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:12 UTC
 * Dependency: ../../../Effect/Produce.js, ../../../Platform/VSCode/Type.js, ../Error.js, @tauri-apps/api/tauri
 */

import { invoke } from "@tauri-apps/api/tauri";

import { FromAsync } from "../../../Effect/Produce.js";
import { type Uri } from "../../../Platform/VSCode/Type.js";
import { PathProblem } from "../Error.js";

const CreateProblem = (cause: unknown): PathProblem =>
	new PathProblem({ cause, operation: "get_user_data_path" });

/**
 * @module FetchUserDataPath
 * @description Effect to get the user data path URI via Tauri.
 */
const Fetch = FromAsync(
	() => invoke<Uri>("mountain_get_user_data_path"),
	CreateProblem,
	{ operation: "get_user_data_path" },
);

export default Fetch;
