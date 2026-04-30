import { Context } from "effect";

import type { WorkbenchContextKeyService } from "../Interface/WorkbenchContextKeyService.js";

export class WorkbenchContextKeyServiceTag extends Context.Tag(
	"Application/WorkbenchContextKeyService",
)<WorkbenchContextKeyServiceTag, WorkbenchContextKeyService>() {}

export const WorkbenchContextKey = WorkbenchContextKeyServiceTag;
export default WorkbenchContextKeyServiceTag;
