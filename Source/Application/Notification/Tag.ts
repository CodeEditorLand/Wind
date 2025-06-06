import { Context } from "effect";
import type { INotificationService } from "vs/platform/notification/common/notification.js";

export type Interface = INotificationService;

const NotificationServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/NotificationService",
);

export default NotificationServiceTag;
