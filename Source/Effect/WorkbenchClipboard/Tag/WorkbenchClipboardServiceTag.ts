import { Context } from "effect";

import type { WorkbenchClipboardService } from "../Interface/WorkbenchClipboardService.js";

export class WorkbenchClipboardServiceTag extends Context.Tag(
	"Application/WorkbenchClipboardService",
)<WorkbenchClipboardServiceTag, WorkbenchClipboardService>() {}

export const WorkbenchClipboard = WorkbenchClipboardServiceTag;

export default WorkbenchClipboardServiceTag;
