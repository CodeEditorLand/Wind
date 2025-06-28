/**
 * @module Error (Application/SourceControlManagement)
 * @description Defines domain-specific, tagged errors for Source Control Management
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during an SCM operation, such as failing
 * to fetch the initial state from the host or an error during an update event.
 */
export class ScmProblem extends Data.TaggedError("ScmProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
