/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for configuration operations at the
 * application layer.
 */

import { Data } from "effect";

import type { IntegrationProblem } from "../Integration/Problem.js";

/**
 * Represents a failure within the `ConfigurationService`.
 *
 * This error acts as a wrapper around more specific problems from the
 * Integration layer (e.g., file system or path resolution errors). This allows
 * higher-level code to catch a single, well-defined error type for this domain,
 * while preserving the original cause for detailed logging and debugging.
 */
export class ApplicationConfigurationProblem extends Data.TaggedError(
	"ApplicationConfigurationProblem",
)<{
	/**
	 * The underlying problem from the Integration layer that caused this failure.
	 */
	readonly Cause: IntegrationProblem;
	/**
	 * A string describing the context of the operation that failed.
	 */
	readonly Context: string;
}> {}
