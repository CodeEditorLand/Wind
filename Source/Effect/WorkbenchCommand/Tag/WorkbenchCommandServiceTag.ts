import { Context } from "effect";

import type { WorkbenchCommandService } from "../Interface/WorkbenchCommandService.js";

export class WorkbenchCommandServiceTag extends Context.Tag(
	"Application/WorkbenchCommandService",
)<WorkbenchCommandServiceTag, WorkbenchCommandService>() {}

export const WorkbenchCommand = WorkbenchCommandServiceTag;

export default WorkbenchCommandServiceTag;
