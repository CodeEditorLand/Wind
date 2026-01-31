/**
 * @module Problem
 * @description
 * Defines domain-specific, tagged errors for debugging operations at the
 * application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure during the registration of a debug provider, such as
 * a `DebugConfigurationProvider` or `DebugAdapterDescriptorFactory`.
 */
export class DebugProviderRegistrationProblem extends Data.TaggedError(
	"DebugProviderRegistrationProblem",
)<{
	readonly DebugType: string;
	readonly Cause?: unknown;
}> {}

/**
 * Represents a failure when attempting to start a debugging session. This
 * typically wraps an error from the host process.
 */
export class StartDebuggingProblem extends Data.TaggedError(
	"StartDebuggingProblem",
)<{
	readonly Cause: unknown;
}> {}
