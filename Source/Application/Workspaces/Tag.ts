/*
 * File: Wind/Source/Application/Workspaces/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:23 UTC
 * Dependency: effect, vs/platform/workspaces/common/workspaces.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IWorkspacesService } from "vs/platform/workspaces/common/workspaces.js";

export type Interface = IWorkspacesService;

const WorkspacesServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/WorkspacesService",
);

export default WorkspacesServiceTag;

import { Context } from "effect";
import type { IWorkspacesService } from "vs/platform/workspaces/common/workspaces.js";

export type Interface = IWorkspacesService;

const WorkspacesServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/WorkspacesService",
);

export default WorkspacesServiceTag;
