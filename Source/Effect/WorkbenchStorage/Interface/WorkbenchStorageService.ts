/**
 * @module Effect/WorkbenchStorage/Interface/WorkbenchStorageService
 * @description
 * Service interface for VS Code's `IStorageService`.
 * Scope-aware (Application / Profile / Workspace) so callers can
 * target the same key in different layers.
 * @category Interface
 */

/**
 * Mirror of VS Code's `StorageScope` enum.
 *
 *   APPLICATION = 0  - persists across all workspaces, all profiles
 *   PROFILE     = 1  - persists across workspaces in the active profile
 *   WORKSPACE   = 2  - bound to the open workspace
 */
export type WorkbenchStorageScope = "Application" | "Profile" | "Workspace";

/**
 * Mirror of VS Code's `StorageTarget` enum.
 *
 *   USER    = 0  - synced via Settings Sync
 *   MACHINE = 1  - machine-local, never synced
 */
export type WorkbenchStorageTarget = "User" | "Machine";

export interface WorkbenchStorageChangeEvent {
	readonly key: string;

	readonly scope: WorkbenchStorageScope;

	readonly target?: WorkbenchStorageTarget;
}

export interface WorkbenchStorageService {
	readonly Get: (
		key: string,

		scope: WorkbenchStorageScope,
	) => string | undefined;

	readonly GetBoolean: (
		key: string,

		scope: WorkbenchStorageScope,
	) => boolean | undefined;

	readonly GetNumber: (
		key: string,

		scope: WorkbenchStorageScope,
	) => number | undefined;

	readonly GetObject: <T = unknown>(
		key: string,

		scope: WorkbenchStorageScope,
	) => T | undefined;

	readonly Store: (
		key: string,

		value: string | number | boolean | object,

		scope: WorkbenchStorageScope,

		target: WorkbenchStorageTarget,
	) => void;

	readonly Remove: (key: string, scope: WorkbenchStorageScope) => void;

	readonly Keys: (
		scope: WorkbenchStorageScope,

		target: WorkbenchStorageTarget,
	) => readonly string[];

	readonly Changes: (
		callback: (event: WorkbenchStorageChangeEvent) => void,
	) => { readonly dispose: () => void };
}
