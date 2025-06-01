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
	// Renamed IHostService to be more action-oriented
	openWindow(
		targets: ReadonlyArray<
			| FolderOpenSpecification
			| FileOpenSpecification
			| WorkspaceOpenSpecification
		>,
		config?: WindowOpenOption, // Renamed parameter
	): Promise<void>;
}

/**
 * @description Tag for accessing the HostService.
 */
const Tag = Context.Tag<PerformAction>("vscode/HostService"); // Tag ID remains for potential interop
export default Tag;
