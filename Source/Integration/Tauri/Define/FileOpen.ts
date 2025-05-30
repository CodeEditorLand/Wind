// Integration/Tauri/Define/FileOpen.ts
// Purpose: Pure factory for creating VSCode IFileToOpen objects.

import type {
	FileOpenSpecification,
	Uri,
} from "../../../Platform/VSCode/Types.js";

/**
 * @module FileOpen (Definition)
 * @description Creates an IFileToOpen (FileOpenSpecification) object for a given URI.
 */
export default function Define(Path: Uri): FileOpenSpecification {
	return { fileUri: Path };
}
