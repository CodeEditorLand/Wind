import { Context } from "effect";

import type { WorkbenchLifecycleService } from "../Interface/WorkbenchLifecycleService.js";

export class WorkbenchLifecycleServiceTag extends Context.Tag(
	"Application/WorkbenchLifecycleService",
)<WorkbenchLifecycleServiceTag, WorkbenchLifecycleService>() {}

export const WorkbenchLifecycle = WorkbenchLifecycleServiceTag;

export default WorkbenchLifecycleServiceTag;
