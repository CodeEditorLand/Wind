// Effect/Produce/OptionalFromAsync.ts

import { Effect, Option, type Data } from "effect";

import type AsyncFunction from "./Type/AsyncFunction.js"; // Adjusted path
import type ErrorProducer from "./Type/ErrorProducer.js"; // Adjusted path

/**
 * @module OptionalFromAsync
 * @description Factory to create an Effect yielding an Option from a promise
 * that may resolve to a nullable value.
 */
export default function OptionalFromAsync<
	Arguments extends any[],
	Value,
	ErrorData extends Record<string, any>,
	ErrorType extends Data.TaggedError<string, { cause: unknown } & ErrorData>,
>(
	Source: AsyncFunction<Arguments, Value | null | undefined>,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Arguments) => Effect.Effect<Option.Option<Value>, ErrorType> {
	return (...args: Arguments) =>
		Effect.tryPromise({
			try: () => Source(...args),
			catch: (cause) =>
				CreateProblem({ ...StaticData, cause } as {
					cause: unknown;
				} & ErrorData),
		}).pipe(Effect.map(Option.fromNullable));
}
