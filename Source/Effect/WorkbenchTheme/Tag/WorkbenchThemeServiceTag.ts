import { Context } from "effect";

import type { WorkbenchThemeService } from "../Interface/WorkbenchThemeService.js";

export class WorkbenchThemeServiceTag extends Context.Tag(
	"Application/WorkbenchThemeService",
)<WorkbenchThemeServiceTag, WorkbenchThemeService>() {}

export const WorkbenchTheme = WorkbenchThemeServiceTag;

export default WorkbenchThemeServiceTag;
