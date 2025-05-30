// Integration/Tauri/Define/FolderOpen.ts
// Purpose: Pure factory for creating VSCode IFolderToOpen (FolderOpenSpecification) objects.

// Using specific type import to match the new file structure for VSCode types
import type {
	FolderOpenSpecification,
	Uri,
} from "../../../Platform/VSCode/Types.js";

/**
 * @module FolderOpen (Definition)
 * @description Creates an IFolderToOpen (FolderOpenSpecification) object for a given URI.
 */
export default function Define(Path: Uri): FolderOpenSpecification {
	return { folderUri: Path };
}
