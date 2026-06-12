/**
 * @module Effect/WorkbenchProduct/Tag/WorkbenchProductServiceTag
 * @description
 * Type alias for `WorkbenchProductService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchProductService } from "../Interface/WorkbenchProductService.js";

export type WorkbenchProductServiceTag = WorkbenchProductService;

export type WorkbenchProduct = WorkbenchProductService;
