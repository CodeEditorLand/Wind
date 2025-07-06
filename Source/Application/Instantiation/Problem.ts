/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for instantiation service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `InstantiationService`, such as
 * a cyclic dependency between services.
 */
export class InstantiationProblem extends Data.TaggedError(
	"InstantiationProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
