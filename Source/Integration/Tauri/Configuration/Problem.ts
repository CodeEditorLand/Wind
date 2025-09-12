/**
 * @module Problem
 * @description
 * Defines a tagged error for configuration-related failures at the
 * integration layer.
 */

import { Data } from "effect";

/**
 * Represents a failure when interacting with configuration at the integration
 * level, for example, failing to parse a JSON file read from disk.
 */
export class TauriConfigurationProblem extends Data.TaggedError(
	"TauriConfigurationProblem",
)<{
	readonly Cause?: unknown;
	readonly Context: string;
}> {}
