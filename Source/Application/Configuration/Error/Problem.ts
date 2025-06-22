/**
 * @module Problem (Configuration/Error)
 * @description Defines a domain-specific, tagged error for configuration operations
 * at the application layer.
 */

import { Data } from "effect";

import type { IntegrationConfigurationProblem } from "../../../Integration/Tauri/Configuration/Error.js";

/**
 * Represents a failure within the Configuration application service.
 *
 * This error acts as a wrapper around a more specific problem from the
 * Integration layer (e.g., a file system error or a JSON parsing error).
 * This allows higher-level code to catch a single, well-defined error type
 * for this domain while preserving the original cause for logging.
 */
export class Problem extends Data.TaggedError(
	"ApplicationConfigurationProblem",
)<{
	/** The underlying problem from the Integration layer that caused this failure. */
	readonly cause: IntegrationConfigurationProblem;

	/** A string describing the context of the operation (e.g., 'FailedToResolveDefaultSettings'). */
	readonly context: string;
}> {}
