/**
 * @module Effect/WorkbenchNotification/Tag/WorkbenchNotificationServiceTag
 * @description
 * Type alias for `WorkbenchNotificationService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchNotificationService } from "../Interface/WorkbenchNotificationService.js";

export type WorkbenchNotificationServiceTag = WorkbenchNotificationService;

export type WorkbenchNotification = WorkbenchNotificationService;
