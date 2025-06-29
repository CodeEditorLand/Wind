/**
 * @module Error (Application/Logger)
 * @description Defines domain-specific, tagged errors for logging
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a logging operation, such as the
 * inability to forward a log message to the native host.
 */
export class LoggerProblem extends Data.TaggedError("LoggerProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
