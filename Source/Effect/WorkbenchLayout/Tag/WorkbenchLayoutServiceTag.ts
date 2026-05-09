import { Context } from "effect";

import type { WorkbenchLayoutService } from "../Interface/WorkbenchLayoutService.js";

export class WorkbenchLayoutServiceTag extends Context.Tag(
	"Application/WorkbenchLayoutService",
)<WorkbenchLayoutServiceTag, WorkbenchLayoutService>() {}

export const WorkbenchLayout = WorkbenchLayoutServiceTag;

export default WorkbenchLayoutServiceTag;
