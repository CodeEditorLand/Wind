// Integration/Tauri/Define/FileOpenSpecification.ts
// Purpose: Pure factory for creating VSCode IFileToOpen objects.

import type {
	FileOpenSpecification as IFileToOpen,
	Uri,
} from "../../../Platform/VSCode/Types.js";

/**
 * @module FileOpenSpecification (File name provides context)
 * @description Creates an IFileToOpen specification object for a given URI.
 */
export default function Define(Path: Uri): IFileToOpen {
	// Renamed makeFileToOpen
	return { fileUri: Path };
}
