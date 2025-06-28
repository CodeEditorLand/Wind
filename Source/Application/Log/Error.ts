/**
 * @module Error (Application/Log)
 * @description Defines domain-specific, tagged errors for logging
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a logging operation, such as the
 * inability to forward a log message to the native host.
 */
export class LogProblem extends Data.TaggedError("LogProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
