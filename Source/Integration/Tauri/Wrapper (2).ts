/*
 * File: Wind/Source/Integration/Tauri/Wrapper (2).ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:11 UTC
 * Export: default
 */

export { default as InitializeStorage } from "./Wrap/InitializeStorage.js";
export { default as SetStorageValue } from "./Wrap/SetStorageValue.js";
export { default as RemoveStorageValue } from "./Wrap/RemoveStorageValue.js";

export { default as ReadFile } from "./Wrap/FsReadFile.js";
export { default as WriteFile } from "./Wrap/FsWriteFile.js";
export { default as Stat } from "./Wrap/FsStat.js";
export { default as Readdir } from "./Wrap/FsReaddir.js";
export { default as Delete } from "./Wrap/FsDelete.js";
export { default as Rename } from "./Wrap/FsRename.js";
export { default as Mkdir } from "./Wrap/FsMkdir.js";
export { default as Watch } from "./Wrap/FsWatch.js";
export { default as Unwatch } from "./Wrap/FsUnwatch.js";
