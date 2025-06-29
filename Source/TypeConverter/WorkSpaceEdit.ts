/**
 * @module WorkSpaceEdit (TypeConverter)
 * @description Implements converters for `vscode.WorkSpaceEdit` and its components,
 * handling complex transformations involving text edits and file operations.
 */

import type { UriComponents } from "vs/base/common/uri.js";
import type { IIdentifiedSingleEditOperation } from "vs/editor/common/model.js";
import type {
	WorkspaceEdit as VSCodeWorkspaceEdit,
	WorkspaceEditEntryMetadata,
} from "vscode";

import {
	TextEdit as ExtHostTextEdit,
	WorkspaceEdit as ExtHostWorkspaceEdit,
	type Uri,
} from "../Platform/VSCode/Type.js";
import {
	FromAPI as TextEditFromAPI,
	ToAPI as TextEditToAPI,
} from "./Main/TextEdit.js";
import { FromAPI as UriFromAPI, ToAPI as UriToAPI } from "./Main/URI.js";

// --- DTO Interfaces for IPC ---

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

// --- Conversion Logic ---

export interface IVersionInformationProvider {
	GetTextDocumentVersion(Uri: Uri): number | undefined;
}

export const FromAPI = (
	Edit: VSCodeWorkspaceEdit,
	VersionProvider?: IVersionInformationProvider,
): IWorkspaceEditDTO => {
	const Result: IWorkspaceEditDTO = { edits: [] };

	for (const [uri, uriEditArray] of Edit.entries()) {
		const Resource = UriFromAPI(uri);
		const VersionId = VersionProvider?.GetTextDocumentVersion(uri);

		for (const SingleEdit of uriEditArray) {
			if (SingleEdit instanceof ExtHostTextEdit) {
				const TextEditDTO: IWorkspaceTextEditDTO = {
					_type: "text",
					resource: Resource,
					edit: TextEditFromAPI(SingleEdit),
				};
				if (VersionId !== undefined) {
					TextEditDTO.versionId = VersionId;
				}
				Result.edits.push(TextEditDTO);
			}
		}
	}

	return Result;
};

export const ToAPI = (DTO: IWorkspaceEditDTO): VSCodeWorkspaceEdit => {
	const Result = new ExtHostWorkspaceEdit();

	for (const Edit of DTO.edits) {
		if (Edit._type === "text") {
			const uri = UriToAPI(Edit.resource);
			const TextEditArray = [TextEditToAPI(Edit.edit)];
			Result.set(uri, TextEditArray);
		} else if (Edit._type === "file") {
			if (Edit.oldResource && Edit.newResource) {
				Result.renameFile(
					UriToAPI(Edit.oldResource),
					UriToAPI(Edit.newResource),
					Edit.options,
				);
			} else if (Edit.newResource) {
				Result.createFile(UriToAPI(Edit.newResource), Edit.options);
			} else if (Edit.oldResource) {
				Result.deleteFile(UriToAPI(Edit.oldResource), Edit.options);
			}
		}
	}
	return Result;
};
