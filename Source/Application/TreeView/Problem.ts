/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for TreeView operations at the
 * application layer.
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
