/**
 * @module Error (Application/QuickInput)
 * @description Defines a domain-specific, tagged error for Quick Input
 * operations at the application layer.
 */

import { Data } from "effect";

import type { HostServiceProblem } from "../Host/Error.js";

/**
 * Represents a failure that occurs during a Quick Input operation, such as
 * showing a Quick Pick or an Input Box. It wraps lower-level errors.
 */
export class QuickInputProblem extends Data.TaggedError("QuickInputProblem")<{
	readonly Cause: HostServiceProblem | Error;
	readonly Context: string;
}> {}
