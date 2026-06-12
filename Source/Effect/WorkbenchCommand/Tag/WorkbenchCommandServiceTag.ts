/**
 * @module Effect/WorkbenchCommand/Tag/WorkbenchCommandServiceTag
 * @description
 * Type alias for `WorkbenchCommandService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchCommandService } from "../Interface/WorkbenchCommandService.js";

export type WorkbenchCommandServiceTag = WorkbenchCommandService;

export type WorkbenchCommand = WorkbenchCommandService;
