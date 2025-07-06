/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for policy service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `PolicyService`, for example,
 * if the policy definition file cannot be read or parsed.
 */
export class PolicyProblem extends Data.TaggedError("PolicyProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
