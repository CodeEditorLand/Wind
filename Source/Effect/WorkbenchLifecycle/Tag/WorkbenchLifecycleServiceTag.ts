/**
 * @module Effect/WorkbenchLifecycle/Tag/WorkbenchLifecycleServiceTag
 * @description
 * Type alias for `WorkbenchLifecycleService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchLifecycleService } from "../Interface/WorkbenchLifecycleService.js";

export type WorkbenchLifecycleServiceTag = WorkbenchLifecycleService;

export type WorkbenchLifecycle = WorkbenchLifecycleService;
