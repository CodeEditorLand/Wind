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
