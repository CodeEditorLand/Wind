import { Context } from "effect";

import type { WorkbenchWorkspaceService } from "../Interface/WorkbenchWorkspaceService.js";

export class WorkbenchWorkspaceServiceTag extends Context.Tag(
	"Application/WorkbenchWorkspaceService",
)<WorkbenchWorkspaceServiceTag, WorkbenchWorkspaceService>() {}

export const WorkbenchWorkspace = WorkbenchWorkspaceServiceTag;
export default WorkbenchWorkspaceServiceTag;
