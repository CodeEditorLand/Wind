/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for URI identity operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `UriIdentityService`. This is
 * unlikely to be used as the service is generally robust, but is defined for
 * architectural consistency.
 */
export class UriIdentityProblem extends Data.TaggedError("UriIdentityProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
