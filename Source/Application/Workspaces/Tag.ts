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
