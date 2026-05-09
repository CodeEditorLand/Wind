import { Context } from "effect";

import type { WorkbenchProductService } from "../Interface/WorkbenchProductService.js";

export class WorkbenchProductServiceTag extends Context.Tag(
	"Application/WorkbenchProductService",
)<WorkbenchProductServiceTag, WorkbenchProductService>() {}

export const WorkbenchProduct = WorkbenchProductServiceTag;

export default WorkbenchProductServiceTag;
