import { Context } from "effect";

import type { WorkbenchDialogService } from "../Interface/WorkbenchDialogService.js";

export class WorkbenchDialogServiceTag extends Context.Tag(
	"Application/WorkbenchDialogService",
)<WorkbenchDialogServiceTag, WorkbenchDialogService>() {}

export const WorkbenchDialog = WorkbenchDialogServiceTag;
export default WorkbenchDialogServiceTag;
