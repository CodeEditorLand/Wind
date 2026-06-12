/**
 * @module Effect/WorkbenchExtension/Tag/WorkbenchExtensionServiceTag
 * @description
 * Type alias for `WorkbenchExtensionService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchExtensionService } from "../Interface/WorkbenchExtensionService.js";

export type WorkbenchExtensionServiceTag = WorkbenchExtensionService;

export type WorkbenchExtension = WorkbenchExtensionService;
