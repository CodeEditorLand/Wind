/*
 * File: Wind/Source/Application/Notification/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:31 UTC
 * Dependency: effect, vs/platform/notification/common/notification.js
 * Export: Interface
 */

import { Context } from "effect";
import type { INotificationService } from "vs/platform/notification/common/notification.js";

export type Interface = INotificationService;

const NotificationServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/NotificationService",
);

export default NotificationServiceTag;
