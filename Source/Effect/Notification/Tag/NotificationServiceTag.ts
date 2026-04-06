import { Context } from "effect";

import type { NotificationService } from "../Interface/NotificationService.js";

export class NotificationServiceTag extends Context.Tag(
	"Application/NotificationService",
)<NotificationServiceTag, NotificationService>() {}

export const Notification = NotificationServiceTag;
export default NotificationServiceTag;
