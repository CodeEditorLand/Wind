/**
 * @module Effect/WorkbenchWorkspace/Tag/WorkbenchWorkspaceServiceTag
 * @description
 * Type alias for `WorkbenchWorkspaceService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchWorkspaceService } from "../Interface/WorkbenchWorkspaceService.js";

export type WorkbenchWorkspaceServiceTag = WorkbenchWorkspaceService;

export type WorkbenchWorkspace = WorkbenchWorkspaceService;
