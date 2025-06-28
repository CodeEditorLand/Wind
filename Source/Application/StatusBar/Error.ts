/**
 * @module Error (Application/StatusBar)
 * @description Defines domain-specific, tagged errors for status bar operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a status bar operation, such as
 * failing to create or update a status bar item via the host.
 */
export class StatusBarProblem extends Data.TaggedError("StatusBarProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
