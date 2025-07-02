/**
 * @module URI (TypeConverter/Main)
 * @description Converts between `vscode.URI` and its DTO representation, `UriComponents`.
 * This centralizes URI serialization to prevent import cycles.
 */

import type { UriComponents } from "@codeeditorland/output/vs/base/common/uri.js";
import type { Uri as VSCodeURI } from "vscode";

import { URI } from "../../Platform/VSCode/Type.js";

/**
 * Converts a `vscode.URI` object into a plain JSON object (`UriComponents`) for IPC.
 * @param TheURI - The `vscode.URI` instance to convert.
 * @returns The `UriComponents` DTO.
 */
export const FromAPI = (TheURI: VSCodeURI): UriComponents => TheURI.toJSON();

/**
 * Revives a URI DTO (`UriComponents`) back into a `vscode.URI` class instance.
 * @param DTO - The `UriComponents` DTO to revive.
 * @returns A new `vscode.URI` instance.
 */
export const ToAPI = (DTO: UriComponents): VSCodeURI => URI.revive(DTO);
