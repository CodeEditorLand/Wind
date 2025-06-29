/**
 * @module ReadRawFile (Integration/Tauri/File)
 * @description Defines an Effect for reading a raw text file using Tauri's FS plugin.
 */
import { Effect } from "effect";
import type { Uri } from "Source/Platform/VSCode/Type.js";
import { IntegrationConfigurationProblem } from "Source/Integration/Tauri/Configuration/Error.js";
/**
 * An Effect that reads the content of a file at a given URI as a string.
 * It wraps the `fs.readTextFile` command from the Tauri FS plugin.
 */
export declare const ReadRawFile: (Uri: Uri) => Effect.Effect<string, IntegrationConfigurationProblem>;
