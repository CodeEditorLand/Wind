/**
 * @module Effect/WorkbenchHost/Tag/WorkbenchHostServiceTag
 * @description
 * Type alias for `WorkbenchHostService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchHostService } from "../Interface/WorkbenchHostService.js";

export type WorkbenchHostServiceTag = WorkbenchHostService;

export type WorkbenchHost = WorkbenchHostService;
