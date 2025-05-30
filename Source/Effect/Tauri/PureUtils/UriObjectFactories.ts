import type {
	IFileToOpen,
	IFolderToOpen,
	IWorkspaceToOpen,
	URI,
} from "../CoreTypes.js";

export const makeFolderToOpen = (uri: URI): IFolderToOpen => ({
	folderUri: uri,
});
export const makeFileToOpen = (uri: URI): IFileToOpen => ({ fileUri: uri });
export const makeWorkspaceToOpen = (uri: URI): IWorkspaceToOpen => ({
	workspaceUri: uri,
});
