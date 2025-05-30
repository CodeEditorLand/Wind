// Integration/Tauri/Wrap/FetchHomeDirectory.ts
// Purpose: Effect wrapper for fetching the Tauri home directory.

import { homeDir as FetchApi } from "@tauri-apps/api/path"; // Renamed import

import { FromAsync } from "../../../Effect/Produce.js"; // Use aggregated import
import { PathProblem } from "../Errors.js"; // Use aggregated import

const CreateProblem = (cause: unknown): PathProblem =>
	new PathProblem({ cause, operation: "homeDir" });

/**
 * @module FetchHomeDirectory
 * @description Effect to get the user's home directory via Tauri.
 */
const Fetch = FromAsync(FetchApi, CreateProblem, { operation: "homeDir" });

export default Fetch;
