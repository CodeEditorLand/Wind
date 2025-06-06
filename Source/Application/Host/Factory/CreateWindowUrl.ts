import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";

const CreateUrl = (
	TargetList: ReadonlyArray<
		| FolderOpenSpecification
		| FileOpenSpecification
		| WorkspaceOpenSpecification
	>,
): string => {
	const QueryParameter = new URLSearchParams();

	TargetList.forEach((Target) => {
		if ("folderUri" in Target) {
			QueryParameter.append("folder-uri", Target.folderUri.toString());
		} else if ("fileUri" in Target) {
			QueryParameter.append("file-uri", Target.fileUri.toString());
		} else if ("workspaceUri" in Target) {
			QueryParameter.append(
				"workspace-uri",
				Target.workspaceUri.toString(),
			);
		}
	});

	// Assuming the base URL for new windows is the root.
	// This might need to be configurable later.
	return `/?${QueryParameter.toString()}`;
};

export default CreateUrl;
