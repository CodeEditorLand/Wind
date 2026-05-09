/**
 * @module Effect/WorkbenchStorage/Interface/WorkbenchStorageService
 * @description
 * Effect-typed service interface for VS Code's `IStorageService`.
 * Scope-aware (Application / Profile / Workspace) so callers can
 * target the same key in different layers.
 * @category Interface
 */

import type { Effect, Stream } from "effect";

import type { WorkbenchStorageProblem } from "../Type/WorkbenchStorageProblem.js";

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
	) => Effect.Effect<string | undefined, WorkbenchStorageProblem>;

	readonly GetBoolean: (
		key: string,

		scope: WorkbenchStorageScope,
	) => Effect.Effect<boolean | undefined, WorkbenchStorageProblem>;

	readonly GetNumber: (
		key: string,

		scope: WorkbenchStorageScope,
	) => Effect.Effect<number | undefined, WorkbenchStorageProblem>;

	readonly GetObject: <T = unknown>(
		key: string,

		scope: WorkbenchStorageScope,
	) => Effect.Effect<T | undefined, WorkbenchStorageProblem>;

	readonly Store: (
		key: string,

		value: string | number | boolean | object,

		scope: WorkbenchStorageScope,

		target: WorkbenchStorageTarget,
	) => Effect.Effect<void, WorkbenchStorageProblem>;

	readonly Remove: (
		key: string,

		scope: WorkbenchStorageScope,
	) => Effect.Effect<void, WorkbenchStorageProblem>;

	readonly Keys: (
		scope: WorkbenchStorageScope,

		target: WorkbenchStorageTarget,
	) => Effect.Effect<readonly string[], WorkbenchStorageProblem>;

	readonly Changes: Stream.Stream<
		WorkbenchStorageChangeEvent,
		WorkbenchStorageProblem
	>;
}
