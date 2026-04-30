import { Context } from "effect";

import type { WorkbenchKeybindingService } from "../Interface/WorkbenchKeybindingService.js";

export class WorkbenchKeybindingServiceTag extends Context.Tag(
	"Application/WorkbenchKeybindingService",
)<WorkbenchKeybindingServiceTag, WorkbenchKeybindingService>() {}

export const WorkbenchKeybinding = WorkbenchKeybindingServiceTag;
export default WorkbenchKeybindingServiceTag;
