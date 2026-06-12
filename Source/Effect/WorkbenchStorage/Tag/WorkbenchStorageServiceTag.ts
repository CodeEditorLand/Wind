/**
 * @module Effect/WorkbenchStorage/Tag/WorkbenchStorageServiceTag
 * @description
 * Type alias for `WorkbenchStorageService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchStorageService } from "../Interface/WorkbenchStorageService.js";

export type WorkbenchStorageServiceTag = WorkbenchStorageService;

export type WorkbenchStorage = WorkbenchStorageService;
