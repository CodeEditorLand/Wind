/**
 * @module Effect/WorkbenchProgress/Tag/WorkbenchProgressServiceTag
 * @description
 * Type alias for `WorkbenchProgressService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchProgressService } from "../Interface/WorkbenchProgressService.js";

export type WorkbenchProgressServiceTag = WorkbenchProgressService;

export type WorkbenchProgress = WorkbenchProgressService;
