/**
 * @module WorkSpaceFolder (TypeConverter/Main)
 * @description Converts `IWorkspaceFolderData` DTO to `vscode.WorkspaceFolder`.
 */

import type { IWorkspaceFolderData } from "vs/platform/workspace/common/workspace.js";
import type { WorkspaceFolder } from "vscode";
import { ToAPI as UriToAPI } from "./URI.js";

/**
 * Revives a workspace folder DTO into a `vscode.WorkspaceFolder` object.
 * @param DTO - The `IWorkspaceFolderData` DTO from the host.
 * @returns An object conforming to the `vscode.WorkspaceFolder` interface.
 */
export const FromDTO = (DTO: IWorkspaceFolderData): WorkspaceFolder => {
	return {
		uri: UriToAPI(DTO.uri),
		name: DTO.name,
		index: DTO.index,
	};
};
