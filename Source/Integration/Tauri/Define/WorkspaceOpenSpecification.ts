// Integration/Tauri/Define/WorkspaceOpenSpecification.ts
// Purpose: Pure factory for creating VSCode IWorkspaceToOpen objects.

import type {
	WorkspaceOpenSpecification as IWorkspaceToOpen,
	Uri,
} from "../../../Platform/VSCode/Types.js";

/**
 * @module WorkspaceOpenSpecification (File name provides context)
 * @description Creates an IWorkspaceToOpen specification object for a given URI.
 */
export default function Define(Path: Uri): IWorkspaceToOpen {
	// Renamed makeWorkspaceToOpen
	return { workspaceUri: Path };
}
