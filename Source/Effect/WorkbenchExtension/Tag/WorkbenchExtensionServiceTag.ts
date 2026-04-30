import { Context } from "effect";

import type { WorkbenchExtensionService } from "../Interface/WorkbenchExtensionService.js";

export class WorkbenchExtensionServiceTag extends Context.Tag(
	"Application/WorkbenchExtensionService",
)<WorkbenchExtensionServiceTag, WorkbenchExtensionService>() {}

export const WorkbenchExtension = WorkbenchExtensionServiceTag;
export default WorkbenchExtensionServiceTag;
