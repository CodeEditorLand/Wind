/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for status bar operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a status bar operation, such as
 * failing to create or update a status bar item via the native host.
 */
export class StatusBarProblem extends Data.TaggedError("StatusBarProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
