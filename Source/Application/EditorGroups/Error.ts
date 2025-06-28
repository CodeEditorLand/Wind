/**
 * @module Error (Application/EditorGroups)
 * @description Defines a domain-specific, tagged error for editor group
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure within the `EditorGroups` application service.
 * This can be used to wrap errors from underlying services or to represent
 * invalid state transitions, such as attempting to remove the last editor group.
 */
export class EditorGroupsProblem extends Data.TaggedError(
	"EditorGroupsProblem",
)<{
	readonly Cause?: unknown;
	readonly Context: string;
}> {}
