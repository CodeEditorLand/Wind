/**
 * @module Effect/WorkbenchClipboard/Tag/WorkbenchClipboardServiceTag
 * @description
 * Type alias for `WorkbenchClipboardService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchClipboardService } from "../Interface/WorkbenchClipboardService.js";

export type WorkbenchClipboardServiceTag = WorkbenchClipboardService;

export type WorkbenchClipboard = WorkbenchClipboardService;
