// Integration/Tauri/Define/FolderOpenSpecification.ts
// Purpose: Pure factory for creating VSCode IFolderToOpen objects.

import type {
	FolderOpenSpecification as IFolderToOpen,
	Uri,
} from "../../../Platform/VSCode/Types.js";

// Using aliased types

/**
 * @module FolderOpenSpecification (File name provides context)
 * @description Creates an IFolderToOpen specification object for a given URI.
 */
export default function Define(Path: Uri): IFolderToOpen {
	// Renamed makeFolderToOpen
	return { folderUri: Path };
}
