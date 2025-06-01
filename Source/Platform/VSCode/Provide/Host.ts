// Platform/VSCode/Provide/Host.ts
// Purpose: Defines Tag and Interface for VSCode's IHostService, adapted for effect-ts.

import { Context } from "effect";

import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../Type.js";

// Assuming these types are correctly defined in ../Type.js

/**
 * @module Host (Service Interface: PerformAction)
 * @description Interface for host-level actions, such as opening new windows,

 * abstracting VSCode's native host capabilities.
 * This interface will be implemented by a service discoverable via its Tag.
 */
export interface PerformAction {
	/**
	 * Opens new windows or focuses existing ones according to the targets and options.
	 * @param targets An array of items (folders, files, workspaces) to open.
	 * @param config Options for how the window(s) should be opened (e.g., force new window).
	 * @returns A promise that resolves when the open action is initiated.
	 */
	openWindow(
		targets: ReadonlyArray<
			| FolderOpenSpecification
			| FileOpenSpecification
			| WorkspaceOpenSpecification
		>,

		config?: WindowOpenOption,
	): Promise<void>;

	// Potentially other host actions like clipboard access, shell operations, etc.
}

/**
 * @description The `effect-ts` `Context.Tag` for accessing the `PerformAction` service.
 * This tag is used to declare dependencies on the host service within `Effect` computations.
 * The identifier "vscode/HostService" helps in uniquely identifying this service in the context.
 */
const Tag = Context.Tag<"vscode/HostService", PerformAction>();

export default Tag;
