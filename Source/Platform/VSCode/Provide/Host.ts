/*
 * File: Wind/Source/Platform/VSCode/Provide/Host.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:56 UTC
 * Dependency: effect
 * Export: PerformAction
 */

// Platform/VSCode/Provide/Host.ts
// Purpose: Defines Tag and Interface for VSCode's IHostService, adapted for effect-ts.

import { Context } from "effect";

import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../Type.js";

/**
 * @module Host (Service Interface: PerformAction)
 * @description Interface for host-level actions, such as opening new windows.
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
 * @description The `effect-ts` `Context.Tag` for the `PerformAction` service.
 * `Context.GenericTag<Identifier, Service>(key)` creates a Tag instance.
 * Here, `PerformAction` serves as both the Identifier type in the Context map
 * and the Service interface type. "vscode/HostService" is the runtime key.
 */
const HostServiceTag = Context.GenericTag<PerformAction, PerformAction>(
	"vscode/HostService",
);

// Type: Tag<PerformAction, PerformAction>

export default HostServiceTag;
