import { Effect, pipe } from "effect";
import { joinPath } from "vs/base/common/resources.js";
import { Uri } from "vs/base/common/uri.js"; // Assuming direct access for now
import {
	WORKSPACE_EXTENSION,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";
import type {
	IStoredWorkspace,
	IStoredWorkspaceFolder,
	IWorkspaceFolderCreationData,
} from "vs/platform/workspaces/common/workspaces.js";

import {
	FetchUntitledWorkspacesHome,
	WriteFile,
} from "../../../Integration/Tauri.js";
import { GetWorkspaceIdentifier } from "./GetWorkspaceIdentifier.js";

// This is a native re-implementation of `getStoredWorkspaceFolder`
const CreateStoredFolder = (
	FolderData: IWorkspaceFolderCreationData,
	UntitledWorkspacesHome: Uri,
): IStoredWorkspaceFolder => {
	// In a truly native implementation, we might not need complex relative path logic
	// if we always store full URIs.
	return { uri: FolderData.uri.toString(), name: FolderData.name };
};

const CreateUntitledWorkspace = (
	FolderList: readonly IWorkspaceFolderCreationData[],
	RemoteAuthority?: string,
): Effect.Effect<IWorkspaceIdentifier, any> => {
	return pipe(
		FetchUntitledWorkspacesHome,
		Effect.flatMap((UntitledWorkspacesHome) => {
			const RandomId = `${Date.now()}${Math.round(Math.random() * 1000)}`;
			const WorkspacePath = joinPath(
				UntitledWorkspacesHome,
				`Untitled-${RandomId}.${WORKSPACE_EXTENSION}`,
			);

			const StoredFolderList = FolderList.map((Folder) =>
				CreateStoredFolder(Folder, UntitledWorkspacesHome),
			);
			const StoredWorkspace: IStoredWorkspace = {
				folders: StoredFolderList,
				remoteAuthority: RemoteAuthority,
			};

			const WorkspaceContent = JSON.stringify(
				StoredWorkspace,
				null,
				"\t",
			);
			const ContentBuffer = new TextEncoder().encode(WorkspaceContent);

			return pipe(
				WriteFile(WorkspacePath, ContentBuffer, {
					create: true,
					overwrite: true,
				}),
				Effect.flatMap(() => GetWorkspaceIdentifier(WorkspacePath)),
			);
		}),
	);
};

export default CreateUntitledWorkspace;
