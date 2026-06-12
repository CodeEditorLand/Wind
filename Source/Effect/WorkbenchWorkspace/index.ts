export type {
	UpstreamWorkspace,
	UpstreamWorkspaceFolder,
	UpstreamWorkspaceFoldersChangeEvent,
	WorkbenchWorkspaceBridgeShape,
	WorkbenchWorkspaceGlobals,
} from "./Implementation/WorkbenchWorkspaceBridgeShape.js";

export { WorkbenchWorkspaceLive } from "./Implementation/WorkbenchWorkspaceLive.js";

export type {
	WorkbenchWorkspaceFolder,
	WorkbenchWorkspaceFolderEvent,
	WorkbenchWorkspaceService,
	WorkbenchWorkspaceSnapshot,
} from "./Interface/WorkbenchWorkspaceService.js";

export type {
	WorkbenchWorkspace,
	WorkbenchWorkspaceServiceTag,
} from "./Tag/WorkbenchWorkspaceServiceTag.js";

export type { WorkbenchWorkspaceProblem } from "./Type/WorkbenchWorkspaceProblem.js";

export { WorkbenchWorkspaceError } from "./Type/WorkbenchWorkspaceProblem.js";
