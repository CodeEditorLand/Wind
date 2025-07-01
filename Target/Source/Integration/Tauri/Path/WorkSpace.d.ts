/**
 * @module WorkSpace (Integration/Tauri/Path)
 * @description Resolves the workspace path using Tauri's API.
 */
import { Effect } from "effect";
import { type Uri } from "../../../Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";
/**
 * An Effect that resolves the path for workspace-specific settings.
 * For a standalone app, we can resolve this relative to the home directory
 * as a sensible default.
 */
export declare const ResolveWorkSpacePath: () => Effect.Effect<Uri, IntegrationPathProblem>;
