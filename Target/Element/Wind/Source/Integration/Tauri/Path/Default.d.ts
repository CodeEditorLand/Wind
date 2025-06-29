/**
 * @module Default (Integration/Tauri/Path)
 * @description Resolves the default application configuration path using Tauri's API.
 */
import { Effect } from "effect";
import { type Uri } from "../../../Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";
/**
 * An Effect that resolves the path to the application's configuration directory.
 * This is typically where user-level `settings.json` would reside.
 */
export declare const ResolveFinalDefaultPath: () => Effect.Effect<Uri, IntegrationPathProblem>;
