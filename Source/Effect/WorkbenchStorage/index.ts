/**
 * @module Effect/WorkbenchStorage
 * @description
 * Public surface of the workbench-tier scope-aware storage service.
 * Distinct from the simpler `Effect/Storage` service which doesn't
 * model VS Code's APPLICATION / PROFILE / WORKSPACE scopes.
 * @category Public
 */

export type {
	WorkbenchStorageBridgeShape,
	WorkbenchStorageGlobals,
} from "./Implementation/WorkbenchStorageBridgeShape.js";
export { WorkbenchStorageLive } from "./Implementation/WorkbenchStorageLive.js";
export {
	WorkbenchStorageScopeCode,
	WorkbenchStorageScopeFromCode,
	WorkbenchStorageTargetCode,
} from "./Implementation/WorkbenchStorageScopeCode.js";
export type {
	WorkbenchStorageChangeEvent,
	WorkbenchStorageScope,
	WorkbenchStorageService,
	WorkbenchStorageTarget,
} from "./Interface/WorkbenchStorageService.js";
export type {
	WorkbenchStorage,
	WorkbenchStorageServiceTag,
} from "./Tag/WorkbenchStorageServiceTag.js";
export type { WorkbenchStorageProblem } from "./Type/WorkbenchStorageProblem.js";
