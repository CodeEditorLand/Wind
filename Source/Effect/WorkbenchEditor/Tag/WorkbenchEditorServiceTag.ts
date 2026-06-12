/**
 * @module Effect/WorkbenchEditor/Tag/WorkbenchEditorServiceTag
 * @description
 * Type alias for `WorkbenchEditorService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchEditorService } from "../Interface/WorkbenchEditorService.js";

export type WorkbenchEditorServiceTag = WorkbenchEditorService;

export type WorkbenchEditor = WorkbenchEditorService;
