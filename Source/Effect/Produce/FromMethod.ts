// Effect/Produce/FromMethod.ts

import { Context, Effect, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

/**
 * @module FromMethod
 * @description Creates an Effect-returning function from an asynchronous method of a service
 *              identified by a `Context.Tag`.
 * @template SourcedInterface The service interface type.
 * @template SourcedTag The `Context.Tag` associated with the service.
 * @template Method The name of the asynchronous method on the service.
 * @template Arguments The arguments tuple type of the method.
 * @template Value The success value type of the method's Promise.
 * @template ErrorData Additional static data for error creation.
 * @template ErrorType The custom error type produced by `CreateProblem`.
 * @param ServiceTag The `Context.Tag` for the service.
 * @param MethodName The name of the method to wrap.
 * @param CreateProblem A function to create a custom error from a cause.
 * @param StaticData Static data to be included in the error.
 * @returns A function that, when called with method arguments, returns an Effect.
 */
export default function FromMethod<
	SourcedInterface,
	// SourcedTag should be an instance of a Tag, identifying SourcedInterface
	// Constraint for a Tag instance
	SourcedTag extends Context.Tag<any, SourcedInterface>,
	Method extends {
		// Extracts keys of SourcedInterface that are async methods
		[Key in keyof SourcedInterface]: SourcedInterface[Key] extends (
			...args: any[]
		) => Promise<any>
			? Key
			: never;
	}[keyof SourcedInterface],
	// Infers arguments of the selected method
	Arguments extends SourcedInterface[Method] extends (
		...args: infer Args
	) => Promise<any>
		? Args
		: never,
	// Infers the resolved value type of the selected method's Promise
	Value extends SourcedInterface[Method] extends (
		...args: any[]
	) => Promise<infer Res>
		? Res
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
): (
	...args: Arguments
) => Effect.Effect<Value, ErrorType, Context.Tag.Service<SourcedTag>> {
	// Requires the service from the tag
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedInterface) => {
			// Type assertion for the method call
			const Operation = (ServiceInstance as any)[MethodName] as (
				...opArgs: Arguments
			) => Promise<Value>;

			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),

				catch: (cause) =>
					CreateProblem({
						...StaticData,

						cause,

						// Ensure type for CreateProblem
					} as { readonly cause: unknown } & ErrorData),
			});
		});
}
