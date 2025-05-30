// Effect/Produce/FromAsync.ts

import { Effect, type Data } from "effect";

import type AsyncFunction from "./Type/AsyncFunction.js"; // Adjusted path to be within Produce directory
import type ErrorProducer from "./Type/ErrorProducer.js"; // Adjusted path

/**
 * @module FromAsync
 * @description Factory to create an Effect from a standard promise-returning API.
 */
export default function FromAsync<
	Arguments extends any[],
	Value,
	ErrorData extends Record<string, any>,
	ErrorType extends Data.TaggedError<string, { cause: unknown } & ErrorData>,
>(
	Source: AsyncFunction<Arguments, Value>,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Arguments) => Effect.Effect<Value, ErrorType> {
	return (...args: Arguments) =>
		Effect.tryPromise({
			try: () => Source(...args),
			catch: (cause) =>
				CreateProblem({ ...StaticData, cause } as {
					cause: unknown;
				} & ErrorData),
		});
}
