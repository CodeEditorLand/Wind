/**
 * @module Effect/WorkbenchStorage/Implementation/WorkbenchStorageScopeCode
 * @description
 * Maps the named `WorkbenchStorageScope` and
 * `WorkbenchStorageTarget` ADTs to the numeric enum codes VS Code's
 * `IStorageService` uses on the wire. Kept in its own file so the
 * Live + Bridge implementations import the same source of truth.
 * @category Implementation
 */

import type {
	WorkbenchStorageScope,
	WorkbenchStorageTarget,
} from "../Interface/WorkbenchStorageService.js";

/**
 * VS Code's `StorageScope` enum (vs/platform/storage/common/storage.ts):
 *   APPLICATION = -1, PROFILE = 0, WORKSPACE = 1.
 *
 * Modern VS Code uses 0/1/-1; older variants 0/1/2. We pin to the
 * current modern values; if VS Code re-numbers upstream, both this
 * file and the `InjectStorageOverlay` transform's composite-key
 * convention need updating in lockstep.
 */
export const WorkbenchStorageScopeCode = (
	Scope: WorkbenchStorageScope,
): number => {
	switch (Scope) {
		case "Application":
			return -1;
		case "Profile":
			return 0;
		case "Workspace":
			return 1;
	}
};

/**
 * VS Code's `StorageTarget` enum:
 *   USER = 0, MACHINE = 1.
 */
export const WorkbenchStorageTargetCode = (
	Target: WorkbenchStorageTarget,
): number => {
	switch (Target) {
		case "User":
			return 0;
		case "Machine":
			return 1;
	}
};

export const WorkbenchStorageScopeFromCode = (
	Code: number,
): WorkbenchStorageScope => {
	switch (Code) {
		case -1:
			return "Application";
		case 0:
			return "Profile";
		case 1:
			return "Workspace";
		default:
			return "Workspace";
	}
};
