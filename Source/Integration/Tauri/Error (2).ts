import FileSystemProblemSource from "./Error/FileSystem.js";
import StorageProblemSource from "./Error/Storage.js";

/** Error during Tauri storage operations. */
export const StorageProblem = StorageProblemSource;
export type StorageProblem = StorageProblemSource;

/** Error during Tauri file system operations. */
export const FileSystemProblem = FileSystemProblemSource;
export type FileSystemProblem = FileSystemProblemSource;
