/**
 * @module Type (Application/File)
 * @description Defines custom data structures for the File service domain.
 */

import type { Uri } from "../../Platform/VSCode/Type.js";

/**
 * Represents a single entry within a directory listing, containing its URI,
 * name, and whether it is a directory.
 */
export interface FileEntry {
	readonly Uri: Uri;
	readonly Name: string;
	readonly IsDirectory: boolean;
}
