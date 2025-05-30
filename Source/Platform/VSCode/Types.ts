// Platform/VSCode/Types.ts
// Purpose: Aggregates and exports core VSCode type definitions.

export { default as Uri, type Uri as UriType } from "./Type/Uri.js";
export { default as Scheme } from "./Type/Scheme.js";
export type { default as FileFilter } from "./Type/FileFilter.js";

// Assuming other type files exist, e.g.:
export type { default as WindowOption } from "./Type/WindowOption.js";
export type { default as FolderOpenSpecification } from "./Type/FolderOpenSpecification.js";
export type { default as FileOpenSpecification } from "./Type/FileOpenSpecification.js";
export type { default as WorkspaceOpenSpecification } from "./Type/WorkspaceOpenSpecification.js";
