/*
 * File: Wind/Source/Application/File/Type.ts
 * Responsibility:
 * Modified: 2025-06-09 15:50:40 UTC
 * Dependency: ../../../Platform/VSCode/Type.js
 * Export: FileEntry
 */

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
