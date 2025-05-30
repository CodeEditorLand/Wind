// Effect/Produce/FromAsync.ts

import { Effect, type Data } from "effect";

import type { AsyncFunction, ErrorProducer } from "./Type.js"; // Use type aggregator

/**
 * @module FromAsync
 * @description Creates an Effect-returning function from a Promise-returning one.
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
