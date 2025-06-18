/*
 * File: Wind/Source/Platform/VSCode/Type/mod.ts
 * Responsibility: Aggregates and re-exports core VS Code data types, interfaces, and enums to provide a clean, stable API boundary for the Wind frontend (Sky) and ensure type consistency when interacting with the Cocoon sidecar.
 * Modified: 2025-06-18 14:33:14 UTC
 * Export: Codicon, Schemas, URI
 */

/**
 * @module Type (Platform/VSCode)
 * @description This module serves as the single source of truth for all core
 * VS Code data types, interfaces, and enums used throughout the Wind application.
 * It aggregates and re-exports them from the underlying `vs/` source files to
 * provide a clean, stable API boundary.
 */

// --- Core Primitives ---
export type { IDisposable } from "vs/base/common/lifecycle.js";
export type { Event } from "vs/base/common/event.js";
export type { CancellationToken } from "vs/base/common/cancellation.js";
export type { ThemeIcon } from "vs/platform/theme/common/themeService.js";
export { Codicon } from "vs/base/common/codicons.js";

// --- URI and Scheme ---
export { URI as Uri } from "vs/base/common/uri.js";
export { Schemas as Scheme } from "vs/base/common/network.js";

// --- Service-specific Types ---
export type {
	IFileOpenOptions,
	IFileSaveOptions,
} from "vs/platform/dialogs/common/dialogs.js";
export type { FileFilter } from "../../../Integration/Tauri/Type.js"; // Assuming this is where the serializable version lives

// --- Workspace and Window Types ---
export type { IWorkspaceFolder } from "vs/platform/workspace/common/workspace.js";
export type {
	IOpenEmptyWindowOptions,
	IOpenWindowOptions,
	IWindowOpenable,
} from "vs/platform/window/common/window.js";
export type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WorkspaceOpenSpecification,
} from "./OpenSpecification.js"; // Assuming these are defined locally
