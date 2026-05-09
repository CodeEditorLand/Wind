import { Context } from "effect";

import type { WorkbenchNotificationService } from "../Interface/WorkbenchNotificationService.js";

export class WorkbenchNotificationServiceTag extends Context.Tag(
	"Application/WorkbenchNotificationService",
)<WorkbenchNotificationServiceTag, WorkbenchNotificationService>() {}

export const WorkbenchNotification = WorkbenchNotificationServiceTag;

export default WorkbenchNotificationServiceTag;
