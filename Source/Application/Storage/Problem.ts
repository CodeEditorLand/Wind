/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for storage operations at the
 * application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during a storage operation, such as failing
 * to initialize a database or write a value. It wraps lower-level errors to
 * provide a consistent error type for the application to handle.
 */
export class StorageProblem extends Data.TaggedError("StorageProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
