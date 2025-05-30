import { Context } from "effect";

import type {
	IFileToOpen,
	IFolderToOpen,
	IOpenWindowOptions,
	IWorkspaceToOpen,
} from "./CoreTypes.js";

// Service Definition for VSCode's IHostService
export interface IHostService {
	openWindow(
		toOpen: ReadonlyArray<IFolderToOpen | IFileToOpen | IWorkspaceToOpen>,
		options?: IOpenWindowOptions,
	): Promise<void>;
	// Add other methods from IHostService if they are used and need to be wrapped.
}
// Tag for IHostService. Used for dependency injection.
export class HostServiceTag extends Context.Tag("vscode/HostService")<
	HostServiceTag,
	IHostService
>() {}

// Add other VSCode service tags here if they become direct dependencies of helpers.
// e.g., if AbstractFileDialogService logic is fully refactored into effects:
// import type { IHistoryService } from "vs/workbench/services/history/common/history";
// export class HistoryServiceTag extends Context.Tag("vscode/HistoryService")<HistoryServiceTag, IHistoryService>() {}
