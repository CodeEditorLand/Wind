/**
 * @module WorkSpaceEdit (TypeConverter)
 * @description Implements converters for `vscode.WorkSpaceEdit` and its components,
 * handling complex transformations involving text edits and file operations.
 */
import type { UriComponents } from "vs/base/common/uri.js";
import type { IIdentifiedSingleEditOperation } from "vs/editor/common/model.js";
import type { WorkspaceEdit as VSCodeWorkspaceEdit, WorkspaceEditEntryMetadata } from "vscode";
import { type Uri } from "../Platform/VSCode/Type.js";
interface IWorkspaceTextEditDTO {
    readonly _type: "text";
    readonly resource: UriComponents;
    readonly edit: IIdentifiedSingleEditOperation;
    readonly metadata?: WorkspaceEditEntryMetadata;
    versionId?: number;
}
interface IWorkspaceFileEditDTO {
    readonly _type: "file";
    oldResource?: UriComponents;
    newResource?: UriComponents;
    options?: any;
    metadata?: WorkspaceEditEntryMetadata;
}
type IWorkspaceEditDTO = {
    edits: Array<IWorkspaceTextEditDTO | IWorkspaceFileEditDTO>;
    metadata?: WorkspaceEditEntryMetadata;
};
export interface IVersionInformationProvider {
    GetTextDocumentVersion(Uri: Uri): number | undefined;
}
export declare const FromAPI: (Edit: VSCodeWorkspaceEdit, VersionProvider?: IVersionInformationProvider) => IWorkspaceEditDTO;
export declare const ToAPI: (DTO: IWorkspaceEditDTO) => VSCodeWorkspaceEdit;
export {};
