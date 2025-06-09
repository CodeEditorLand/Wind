/*
 * File: Wind/Source/Integration/Tauri/Error (2).ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:13 UTC
 * Dependency: ./Error/FileSystem.js, ./Error/Storage.js
 * Export: FileSystemProblem, StorageProblem
 */

import FileSystemProblemSource from "./Error/FileSystem.js";
import StorageProblemSource from "./Error/Storage.js";

/** Error during Tauri storage operations. */
export const StorageProblem = StorageProblemSource;
export type StorageProblem = StorageProblemSource;

/** Error during Tauri file system operations. */
export const FileSystemProblem = FileSystemProblemSource;
export type FileSystemProblem = FileSystemProblemSource;
