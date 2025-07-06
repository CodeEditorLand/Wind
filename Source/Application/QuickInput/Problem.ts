/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for Quick Input operations at the
 * application layer.
 */

import { Data } from "effect";
import type { HostProblem } from "../Host/Problem.js";

/**
 * Represents a failure that occurs during a Quick Input operation, such as
 * showing a Quick Pick or an Input Box. It wraps lower-level errors to provide
 * a clear failure context.
 */
export class QuickInputProblem extends Data.TaggedError("QuickInputProblem")<{
	readonly Cause: HostProblem | Error;
	readonly Context: string;
}> {}
