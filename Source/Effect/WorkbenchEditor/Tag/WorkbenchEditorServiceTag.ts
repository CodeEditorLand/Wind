import { Context } from "effect";

import type { WorkbenchEditorService } from "../Interface/WorkbenchEditorService.js";

export class WorkbenchEditorServiceTag extends Context.Tag(
	"Application/WorkbenchEditorService",
)<WorkbenchEditorServiceTag, WorkbenchEditorService>() {}

export const WorkbenchEditor = WorkbenchEditorServiceTag;

export default WorkbenchEditorServiceTag;
