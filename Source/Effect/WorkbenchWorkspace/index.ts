export type {
	WorkbenchWorkspaceServiceTag,
	WorkbenchWorkspace,
} from "./Tag/WorkbenchWorkspaceServiceTag.js";

export type {
	WorkbenchWorkspaceService,
	WorkbenchWorkspaceFolder,
	WorkbenchWorkspaceSnapshot,
	WorkbenchWorkspaceFolderEvent,
} from "./Interface/WorkbenchWorkspaceService.js";

export type { WorkbenchWorkspaceProblem } from "./Type/WorkbenchWorkspaceProblem.js";

export type {
	UpstreamWorkspace,
	UpstreamWorkspaceFolder,
	UpstreamWorkspaceFoldersChangeEvent,
	WorkbenchWorkspaceBridgeShape,
	WorkbenchWorkspaceGlobals,
} from "./Implementation/WorkbenchWorkspaceBridgeShape.js";

export { WorkbenchWorkspaceLive } from "./Implementation/WorkbenchWorkspaceLive.js";
