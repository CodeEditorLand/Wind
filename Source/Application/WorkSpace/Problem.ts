/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for workspace operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `WorkSpaceService`, for example,
 * an error during the initialization of the workspace context.
 */
export class WorkSpaceProblem extends Data.TaggedError("WorkSpaceProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
