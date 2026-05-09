import { Context } from "effect";

import type { WorkbenchHostService } from "../Interface/WorkbenchHostService.js";

export class WorkbenchHostServiceTag extends Context.Tag(
	"Application/WorkbenchHostService",
)<WorkbenchHostServiceTag, WorkbenchHostService>() {}

export const WorkbenchHost = WorkbenchHostServiceTag;

export default WorkbenchHostServiceTag;
