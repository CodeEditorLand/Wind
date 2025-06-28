/**
 * @module Error (Application/Storage)
 * @description Defines domain-specific, tagged errors for storage
 * operations at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a storage operation, such as failing
 * to initialize a database or write a value. It wraps lower-level errors.
 */
export class StorageProblem extends Data.TaggedError("StorageProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
