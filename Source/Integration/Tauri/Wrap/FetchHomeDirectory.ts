/*
 * File: Wind/Source/Integration/Tauri/Wrap/FetchHomeDirectory.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:57 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/path
 */

// Integration/Tauri/Wrap/FetchHomeDirectory.ts
// Purpose: Effect wrapper for fetching the Tauri home directory.

import { homeDir as SourceApi } from "@tauri-apps/api/path";

// Path to meta-factory aggregator
import { FromAsync } from "../../../Effect/Produce.js";
// Path to error aggregator
import { PathProblem } from "../Error.js";

const CreateProblem = (cause: unknown): PathProblem =>
	new PathProblem({ cause, operation: "homeDir" });

/**
 * @module FetchHomeDirectory
 * @description Effect to get the user's home directory via Tauri.
 */
const Fetch = FromAsync(SourceApi, CreateProblem, { operation: "homeDir" });

export default Fetch;
