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
	) => boolean;

	/** Mark a resource as dirty or clean. */
	readonly SetDirty: (
		uri: string,

		dirty: boolean,
	) => void;

	/** Return all URIs that currently have unsaved changes. */
	readonly GetAllDirty: () => readonly string[];

	/** Return the count of resources with unsaved changes. */
	readonly GetDirtyCount: () => number;
}
