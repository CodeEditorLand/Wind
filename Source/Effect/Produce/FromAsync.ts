// Effect/Produce/FromAsync.ts

// Import Cause
import { Cause, Effect } from "effect";

// Use type aggregator
// Assuming these are defined appropriately:
type AsyncFunction<Argument extends any[], Value> = (
	...args: Argument
) => Promise<Value>;

// ErrorProducer produces an ErrorType, which must include a cause
type ErrorProducer<
	ErrorData extends Record<string, any>,
	// ErrorType must be a yieldable error, tagged, include 'cause' and ErrorData
	ErrorType extends Cause.YieldableError & {
		readonly _tag: string;

		readonly cause: unknown;
	} & ErrorData,
> = (
	// The input to the producer
	data: { readonly cause: unknown } & ErrorData,
) => ErrorType;

/**
 * @module FromAsync
 * @description Creates an Effect-returning function from a Promise-returning one.
 */
export default function FromAsync<
	Argument extends any[],
	Value,
	// Static data, doesn't include 'cause' initially
	ErrorData extends Record<string, any>,
	// ErrorType must be a yieldable error, tagged, include 'cause' and ErrorData
	ErrorType extends Cause.YieldableError & {
		readonly _tag: string;

		readonly cause: unknown;
	} & ErrorData,
>(
	Source: AsyncFunction<Argument, Value>,

	CreateProblem: ErrorProducer<ErrorData, ErrorType>,

	// This is the data *without* the cause
	StaticData: ErrorData,
): (...args: Argument) => Effect.Effect<Value, ErrorType> {
	return (...args: Argument) =>
		Effect.tryPromise({
			try: () => Source(...args),

			catch: (
				// This 'cause' is unknown from the promise rejection
				cause,
			) =>
				CreateProblem({
					...StaticData,

					// Add the runtime cause to the static data
					cause,

					// Assert the type for CreateProblem's arg
				} as { readonly cause: unknown } & ErrorData),
		});
}
