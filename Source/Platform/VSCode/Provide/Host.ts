// Platform/VSCode/Provide/Host.ts
// Purpose: Defines the Tag and Interface for VSCode's IHostService.

import { Context } from "effect";

// Assuming types are aggregated if not directly imported
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOption,
	WorkspaceOpenSpecification,
} from "../Types.js";

/**
 * @module Host (Service Interface: PerformHostAction)
 * @description Interface for a service that can open new windows or handle host-level operations.
 * Renamed from IHostService for action-orientation.
 */
export interface PerformHostAction {
	openWindow(
		targets: ReadonlyArray<
			| FolderOpenSpecification
			| FileOpenSpecification
			| WorkspaceOpenSpecification
		>,
		config?: WindowOption,
	): Promise<void>;
}

/**
 * @description Tag for accessing the HostService.
 */
const Host = Context.Tag<PerformHostAction>("vscode/HostService");
export default Host;
