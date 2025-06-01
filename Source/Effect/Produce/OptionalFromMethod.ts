// Effect/Produce/OptionalFromMethod.ts

import { Context, Effect, Option, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

/**
 * @module OptionalFromMethod
 * @description Creates an Effect<Option<Value>> from an async service method that might resolve to null/undefined.
 * @template SourcedInterface The service interface type.
 * @template SourcedTag The `Context.Tag` for the service.
 * @template Method The name of the async method.
 * @template Arguments The arguments tuple type of the method.
 * @template Value The non-nullable success value type of the method's Promise.
 * @template ErrorData Additional static data for error creation.
 * @template ErrorType The custom error type.
 * @param ServiceTag The `Context.Tag` for the service.
 * @param MethodName The name of the method to wrap.
 * @param CreateProblem A function to create a custom error.
 * @param StaticData Static data for the error.
 * @returns A function that returns an Effect yielding an Option of the method's result.
 */
export default function OptionalFromMethod<
	SourcedInterface,
	// Constraint for a Tag instance
	SourcedTag extends Context.Tag<any, SourcedInterface>,
	Method extends {
		// Extracts keys of SourcedInterface that are async methods resolving to V | null | undefined
		[Key in keyof SourcedInterface]: SourcedInterface[Key] extends (
			...args: any[]
			// Method can resolve to null/undefined
		) => Promise<any | null | undefined>
			? Key
			: never;
	}[keyof SourcedInterface],
	Arguments extends SourcedInterface[Method] extends (
		...args: infer Args
	) => Promise<any | null | undefined>
		? Args
		: never,
	// Value is NonNullable, as Option.fromNullable will handle null/undefined
	Value extends SourcedInterface[Method] extends (
		...args: any[]
	) => Promise<infer Res | null | undefined>
		? // Ensure Value is not nullable itself
			NonNullable<Res>
		: never,
	ErrorData extends Record<string, any>,
	ErrorType extends Cause.YieldableError & {
		readonly _tag: string;

		readonly cause: unknown;
	} & ErrorData,
>(
	ServiceTag: SourcedTag,

	MethodName: Method,

	CreateProblem: ErrorProducer<ErrorData, ErrorType>,

	StaticData: ErrorData,
): (...args: Arguments) => Effect.Effect<
	// The Effect yields an Option
	Option.Option<Value>,
	ErrorType,
	// Requires the service
	Context.Tag.Service<SourcedTag>
> {
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedInterface) => {
			const Operation = (ServiceInstance as any)[MethodName] as (
				...opArgs: Arguments
				// Promise can be Value, null, or undefined
			) => Promise<Value | null | undefined>;

			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),

				catch: (cause) =>
					CreateProblem({ ...StaticData, cause } as {
						readonly cause: unknown;
					} & ErrorData),

				// Convert null/undefined result to Option.none()
			}).pipe(Effect.map(Option.fromNullable));
		});
}
