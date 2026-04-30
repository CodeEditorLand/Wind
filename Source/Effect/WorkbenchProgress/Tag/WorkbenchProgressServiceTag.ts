import { Context } from "effect";

import type { WorkbenchProgressService } from "../Interface/WorkbenchProgressService.js";

export class WorkbenchProgressServiceTag extends Context.Tag(
	"Application/WorkbenchProgressService",
)<WorkbenchProgressServiceTag, WorkbenchProgressService>() {}

export const WorkbenchProgress = WorkbenchProgressServiceTag;
export default WorkbenchProgressServiceTag;
