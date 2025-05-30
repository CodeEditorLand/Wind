// Platform/VSCode/Types.ts
// Purpose: Aggregates core VSCode type definitions.

export { default as UriConstructor, type Type as Uri } from "./Type/Uri.js"; // Export constructor and type
export { default as Scheme } from "./Type/Scheme.js";
export type { default as FileFilter } from "./Type/FileFilter.js";
export type { default as WindowOpenOption } from "./Type/WindowOpenOption.js";
export type { default as FolderOpenSpecification } from "./Type/FolderOpenSpecification.js";
export type { default as FileOpenSpecification } from "./Type/FileOpenSpecification.js";
export type { default as WorkspaceOpenSpecification } from "./Type/WorkspaceOpenSpecification.js";
