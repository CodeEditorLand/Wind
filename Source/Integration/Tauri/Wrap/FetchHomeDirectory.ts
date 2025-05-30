

// Integration/Tauri/Wrap/FetchHomeDirectory.ts
// Purpose: Effect wrapper for fetching the Tauri home directory.

import { homeDir as SourceApi } from "@tauri-apps/api/path";
import { FromAsync } from "../../../Effect/Produce.js"; // Path to meta-factory aggregator
import { PathProblem } from "../Errors.js";          // Path to error aggregator

const CreateProblem = (cause: unknown): PathProblem =>
    new PathProblem({ cause, operation: "homeDir" });

/**
 * @module FetchHomeDirectory
 * @description Effect to get the user's home directory via Tauri.
 */
const Fetch = FromAsync(
	SourceApi,
	CreateProblem,
	{ operation: "homeDir" }
);
export default Fetch;
