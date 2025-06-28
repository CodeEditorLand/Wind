/**
 * @module Error (Application/TreeView)
 * @description Defines domain-specific, tagged errors for TreeView operations
 * at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs when a TreeView operation fails, such as
 * failing to fetch children for a tree item from the native host.
 */
export class TreeViewProblem extends Data.TaggedError("TreeViewProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
