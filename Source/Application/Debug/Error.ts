/**
 * @module Error (Application/Debug)
 * @description Defines domain-specific, tagged errors for debugging operations.
 */

import { Data } from "effect";

/**
 * Represents a failure during the registration of a debug provider.
 */
export class DebugProviderRegistrationProblem extends Data.TaggedError(
	"DebugProviderRegistrationProblem",
)<{
	readonly DebugType: string;
	readonly Cause?: unknown;
}> {}

/**
 * Represents a failure when attempting to start a debugging session.
 */
export class StartDebuggingProblem extends Data.TaggedError(
	"StartDebuggingProblem",
)<{
	readonly Cause: unknown;
}> {}
