/**
 * @module Effect/WorkbenchKeybinding/Tag/WorkbenchKeybindingServiceTag
 * @description
 * Type alias for `WorkbenchKeybindingService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchKeybindingService } from "../Interface/WorkbenchKeybindingService.js";

export type WorkbenchKeybindingServiceTag = WorkbenchKeybindingService;

export type WorkbenchKeybinding = WorkbenchKeybindingService;
