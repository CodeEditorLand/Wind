import { Context } from "effect";

import type { WorkspacesService } from "../Interface/WorkspacesService.js";

export class WorkspacesServiceTag extends Context.Tag(
	"Application/WorkspacesService",
)<WorkspacesServiceTag, WorkspacesService>() {}

export const Workspaces = WorkspacesServiceTag;
export default WorkspacesServiceTag;
