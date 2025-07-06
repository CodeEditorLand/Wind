/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for untitled text editor service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `UntitledTextEditorService`,
 * for example, if a model cannot be created or resolved.
 */
export class UntitledTextEditorProblem extends Data.TaggedError(
	"UntitledTextEditorProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
