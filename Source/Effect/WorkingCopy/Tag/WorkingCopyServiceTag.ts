import { Context } from "effect";

import type { WorkingCopyService } from "../Interface/WorkingCopyService.js";

export class WorkingCopyServiceTag extends Context.Tag(
	"Application/WorkingCopyService",
)<WorkingCopyServiceTag, WorkingCopyService>() {}

export const WorkingCopy = WorkingCopyServiceTag;

export default WorkingCopyServiceTag;
