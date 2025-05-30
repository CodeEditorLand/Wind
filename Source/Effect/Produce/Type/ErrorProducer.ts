// Effect/Produce/Type/ErrorProducer.ts

import type { Data } from "effect";

/**
 * @module ErrorProducer
 * @description Factory for creating custom Data.TaggedError instances.
 * @template DataPayload - Error-specific payload (excluding 'cause').
 * @template ErrorType - The custom Data.TaggedError type.
 */
export default interface ErrorProducer<
	DataPayload extends Record<string, any>,
	ErrorType extends Data.TaggedError<
		string,
		{ cause: unknown } & DataPayload
	>,
> {
	(properties: { cause: unknown } & DataPayload): ErrorType;
}
