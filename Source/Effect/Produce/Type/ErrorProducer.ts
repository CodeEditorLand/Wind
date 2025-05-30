// Effect/Produce/Type/ErrorProducer.ts

import type { Data } from "effect";

/**
 * @module ErrorProducer
 * @description Type definition for a factory function that creates custom errors.
 * @template DataPayload - The payload properties specific to this error, excluding 'cause'.
 * @template ErrorType - The custom error type, must extend Data.TaggedError.
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
