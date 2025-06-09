/*
 * File: Wind/Source/Integration/Tauri/Define/FileOpen.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:00 UTC
 * Export: Define
 */

// Integration/Tauri/Define/FileOpen.ts
// Purpose: Pure factory for creating VSCode IFileToOpen objects.

import type {
	FileOpenSpecification,
	Uri,
} from "../../../Platform/VSCode/Type.js";

/**
 * @module FileOpen (Definition)
 * @description Creates an IFileToOpen (FileOpenSpecification) object for a given URI.
 */
export default function Define(Path: Uri): FileOpenSpecification {
	return { fileUri: Path };
}
