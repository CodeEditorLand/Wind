/**
 * @module Type (File)
 * @description Defines custom types for the File service.
 */

import type { Uri } from "../../../Platform/VSCode/Type.js";

/**
 * Represents a single entry within a directory listing.
 */
export interface FileEntry {
	readonly Uri: Uri;
	readonly Name: string;
	readonly IsDirectory: boolean;
}
