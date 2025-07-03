/**
 * @module WorkSpaceFolder (TypeConverter/Main)
 * @description Converts `IWorkspaceFolderData` DTO to `vscode.WorkspaceFolder`.
 */
import type { IWorkspaceFolderData } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import type { WorkspaceFolder } from "vscode";
/**
 * Revives a workspace folder DTO into a `vscode.WorkspaceFolder` object.
 * @param DTO - The `IWorkspaceFolderData` DTO from the host.
 * @returns An object conforming to the `vscode.WorkspaceFolder` interface.
 */
export declare const FromDTO: (DTO: IWorkspaceFolderData) => WorkspaceFolder;
//# sourceMappingURL=WorkSpaceFolder.d.ts.map