// Effect/Produce/OptionalFromAsync.ts

// Added Cause
import { Effect, Option, type Cause } from "effect";

// Use type aggregator
import type { AsyncFunction, ErrorProducer } from "./Type.js";

/**
 * @module OptionalFromAsync
 * @description Creates an Effect<Option<Value>> from a Promise that might resolve to null/undefined.
 */
export default function OptionalFromAsync<
	Argument extends any[],
	Value,
	ErrorData extends Record<string, any>,
	ErrorType extends Cause.YieldableError & {
		// Updated constraint to match ErrorProducer
		readonly _tag: string;

		readonly cause: unknown;
	} & ErrorData,
>(
	Source: AsyncFunction<Argument, Value | null | undefined>,

	CreateProblem: ErrorProducer<ErrorData, ErrorType>,

	StaticData: ErrorData,
): (...args: Argument) => Effect.Effect<Option.Option<Value>, ErrorType> {
	return (...args: Argument) =>
		Effect.tryPromise({
			try: () => Source(...args),

			catch: (cause) =>
				CreateProblem({ ...StaticData, cause } as {
					// Ensure 'as' matches ErrorProducer input
					readonly cause: unknown;
				} & ErrorData),
		}).pipe(Effect.map(Option.fromNullable));
}
