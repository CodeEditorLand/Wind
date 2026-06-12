/**
 * @module Effect/WorkbenchContextKey/Tag/WorkbenchContextKeyServiceTag
 * @description
 * Type alias for `WorkbenchContextKeyService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { WorkbenchContextKeyService } from "../Interface/WorkbenchContextKeyService.js";

export type WorkbenchContextKeyServiceTag = WorkbenchContextKeyService;

export type WorkbenchContextKey = WorkbenchContextKeyService;
