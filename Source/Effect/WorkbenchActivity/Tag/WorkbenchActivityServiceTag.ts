import { Context } from "effect";

import type { WorkbenchActivityService } from "../Interface/WorkbenchActivityService.js";

export class WorkbenchActivityServiceTag extends Context.Tag(
	"Application/WorkbenchActivityService",
)<WorkbenchActivityServiceTag, WorkbenchActivityService>() {}

export const WorkbenchActivity = WorkbenchActivityServiceTag;

export default WorkbenchActivityServiceTag;
