// Integration/Tauri/Define/WorkspaceOpen.ts
// Purpose: Pure factory for creating VSCode IWorkspaceToOpen objects.

import type {
	Uri,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";

/**
 * @module WorkspaceOpen (Definition)
 * @description Creates an IWorkspaceToOpen (WorkspaceOpenSpecification) object for a given URI.
 */
export default function Define(Path: Uri): WorkspaceOpenSpecification {
	return { workspaceUri: Path };
}
