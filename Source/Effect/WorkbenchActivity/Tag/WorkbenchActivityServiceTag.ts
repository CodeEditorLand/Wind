/**
 * @module Effect/WorkbenchActivity/Tag/WorkbenchActivityServiceTag
 * @description
 * Type alias for `WorkbenchActivityService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchActivityService } from "../Interface/WorkbenchActivityService.js";

export type WorkbenchActivityServiceTag = WorkbenchActivityService;

export type WorkbenchActivity = WorkbenchActivityService;
