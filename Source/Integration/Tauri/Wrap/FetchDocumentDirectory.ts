/*
 * File: Wind/Source/Integration/Tauri/Wrap/FetchDocumentDirectory.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:57 UTC
 * Dependency: ../../../Effect/Produce.js, ../Error.js, @tauri-apps/api/path
 */

// Integration/Tauri/Wrap/FetchDocumentDirectory.ts
// Purpose: Effect wrapper for fetching the Tauri document directory.

import { documentDir as SourceApi } from "@tauri-apps/api/path";

import { FromAsync } from "../../../Effect/Produce.js";
import { PathProblem } from "../Error.js";

const CreateProblem = (cause: unknown): PathProblem =>
	new PathProblem({ cause, operation: "documentDir" });

/**
 * @module FetchDocumentDirectory
 * @description Effect to get the user's document directory via Tauri.
 */
const Fetch = FromAsync(SourceApi, CreateProblem, { operation: "documentDir" });

export default Fetch;
