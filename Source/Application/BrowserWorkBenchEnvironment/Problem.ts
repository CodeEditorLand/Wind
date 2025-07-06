/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for environment service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `BrowserWorkbenchEnvironmentService`,
 * for example, if the initial configuration from the host is missing or malformed.
 */
export class BrowserWorkbenchEnvironmentProblem extends Data.TaggedError(
	"BrowserWorkbenchEnvironmentProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
