/*
 * File: Wind/Source/Effect/Produce/Type/ErrorProducer.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:01 UTC
 * Dependency: effect
 * Export: ErrorProducer
 */

// Effect/Produce/Type/ErrorProducer.ts
// Purpose: Aggregates types for the Produce module.

// Import Cause for YieldableError
import type { Cause } from "effect";

/**
 * @module ErrorProducer
 * @description Factory for creating custom Data.TaggedError instances.
 * @template DataPayload - Error-specific payload (excluding 'cause').
 * @template ErrorType - The custom tagged error instance type.
 */
export default interface ErrorProducer<
	DataPayload extends Record<string, any>,
	ErrorType extends Cause.YieldableError & {
		// Ensure it's a YieldableError
		// TaggedError instances have a _tag
		readonly _tag: string;

		// 'cause' must be a property
		readonly cause: unknown;

		// And it includes the payload
	} & DataPayload,
> {
	(properties: { readonly cause: unknown } & DataPayload): ErrorType;
}
