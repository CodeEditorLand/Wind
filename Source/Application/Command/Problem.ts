/**
 * @module Problem
 * @description
 * Defines the domain-specific, tagged error for command operations within the
 * application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs when executing or registering a command.
 * This can wrap errors from the IPC layer or represent issues like an
 * unknown command being invoked.
 */
export class CommandProblem extends Data.TaggedError("CommandProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
