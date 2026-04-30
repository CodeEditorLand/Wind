/**
 * @module Effect/WorkbenchStorage
 * @description
 * Public surface of the workbench-tier scope-aware storage service.
 * Distinct from the simpler `Effect/Storage` service which doesn't
 * model VS Code's APPLICATION / PROFILE / WORKSPACE scopes.
 * @category Public
 */

export {
	WorkbenchStorageServiceTag,
	WorkbenchStorage,
} from "./Tag/WorkbenchStorageServiceTag.js";
export type {
	WorkbenchStorageService,
	WorkbenchStorageScope,
	WorkbenchStorageTarget,
	WorkbenchStorageChangeEvent,
} from "./Interface/WorkbenchStorageService.js";
export type { WorkbenchStorageProblem } from "./Type/WorkbenchStorageProblem.js";
export {
	WorkbenchStorageScopeCode,
	WorkbenchStorageTargetCode,
	WorkbenchStorageScopeFromCode,
} from "./Implementation/WorkbenchStorageScopeCode.js";
export type {
	WorkbenchStorageBridgeShape,
	WorkbenchStorageGlobals,
} from "./Implementation/WorkbenchStorageBridgeShape.js";
export { WorkbenchStorageLive } from "./Implementation/WorkbenchStorageLive.js";
