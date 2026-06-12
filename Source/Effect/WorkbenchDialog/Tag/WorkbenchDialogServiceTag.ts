/**
 * @module Effect/WorkbenchDialog/Tag/WorkbenchDialogServiceTag
 * @description
 * Type alias for `WorkbenchDialogService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchDialogService } from "../Interface/WorkbenchDialogService.js";

export type WorkbenchDialogServiceTag = WorkbenchDialogService;

export type WorkbenchDialog = WorkbenchDialogService;
