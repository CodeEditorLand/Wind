// Effect/Produce/OptionalFromAsync.ts

import { Effect, Option, type Data } from "effect";

// Use type aggregator
import type { AsyncFunction, ErrorProducer } from "./Type.js";

/**
 * @module OptionalFromAsync
 * @description Creates an Effect<Option<Value>> from a Promise that might resolve to null/undefined.
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
