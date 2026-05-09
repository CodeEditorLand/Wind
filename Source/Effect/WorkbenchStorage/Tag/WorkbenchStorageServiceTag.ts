/**
 * @module Effect/WorkbenchStorage/Tag/WorkbenchStorageServiceTag
 * @description Context tag for the workbench-tier scope-aware
 * storage service. Distinct from the simpler `Storage` tag in
 * `Effect/Storage` so consumers can pick whichever surface fits.
 * @category Tag
 */

import { Context } from "effect";

import type { WorkbenchStorageService } from "../Interface/WorkbenchStorageService.js";

export class WorkbenchStorageServiceTag extends Context.Tag(
	"Application/WorkbenchStorageService",
)<WorkbenchStorageServiceTag, WorkbenchStorageService>() {}

export const WorkbenchStorage = WorkbenchStorageServiceTag;

export default WorkbenchStorageServiceTag;
