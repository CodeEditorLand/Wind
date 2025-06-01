// Platform/VSCode/Provide/Host.ts
// Purpose: Defines Tag and Interface for VSCode's IHostService.

import { Context } from "effect";

import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../Type.js";

/**
 * @module Host (Service Interface: PerformAction)
 * @description Interface for host-level actions, like opening windows.
 */
export interface PerformAction {
	openWindow(
		targets: ReadonlyArray<
			| FolderOpenSpecification
			| FileOpenSpecification
			| WorkspaceOpenSpecification
		>,

		config?: WindowOpenOption,
	): Promise<void>;
}

/**
 * @description Tag for accessing the HostService.
 */
const Tag = Context.Tag<PerformAction>("vscode/HostService");

// The type of 'Tag' is now Context.Tag<PerformAction>

export default Tag;
