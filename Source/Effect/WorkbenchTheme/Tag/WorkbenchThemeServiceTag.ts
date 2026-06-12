/**
 * @module Effect/WorkbenchTheme/Tag/WorkbenchThemeServiceTag
 * @description
 * Type alias for `WorkbenchThemeService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchThemeService } from "../Interface/WorkbenchThemeService.js";

export type WorkbenchThemeServiceTag = WorkbenchThemeService;

export type WorkbenchTheme = WorkbenchThemeService;
