import type { Effect } from "effect";

import type { WorkingCopyProblem } from "../Type/WorkingCopyProblem.js";

/**
 * WorkingCopy service interface.
 * Tracks the dirty (unsaved) state of open editor resources.
 * Drives the dirty dot shown in editor tabs and the explorer badge.
 *
 * Microsoft VSCode Reference: IWorkingCopyService from
 * vs/workbench/services/workingCopy/common/workingCopyService.ts
 */
export interface WorkingCopyService {

	/** Returns true if the given URI has unsaved changes. */
	readonly IsDirty: (
		uri: string,
	) => Effect.Effect<boolean, WorkingCopyProblem>;

	/** Mark a resource as dirty or clean. */
	readonly SetDirty: (
		uri: string,

		dirty: boolean,
	) => Effect.Effect<void, WorkingCopyProblem>;

	/** Return all URIs that currently have unsaved changes. */
	readonly GetAllDirty: () => Effect.Effect<
		readonly string[],

		WorkingCopyProblem
	>;

	/** Return the count of resources with unsaved changes. */
	readonly GetDirtyCount: () => Effect.Effect<number, WorkingCopyProblem>;
}
