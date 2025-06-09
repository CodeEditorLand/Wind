/*
 * File: Wind/Source/Integration/Tauri/Wrap/FetchMachineId.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:13 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/tauri
 */

import { invoke } from "@tauri-apps/api/tauri";

import { FromAsync } from "../../../Effect/Produce.js";
import { HostProblem } from "../Error.js"; // Assuming a generic HostProblem for system info

const CreateProblem = (cause: unknown): HostProblem =>
	new HostProblem({ cause, operation: "get_machine_id" });

/**
 * @module FetchMachineId
 * @description Effect to get the machine ID via Tauri.
 */
const Fetch = FromAsync(
	() => invoke<string>("mountain_get_machine_id"),
	CreateProblem,
	{ operation: "get_machine_id" },
);

export default Fetch;
