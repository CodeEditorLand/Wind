// Effect/Produce/FromMethod.ts
import { Context, Effect, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

/**
 * @module FromMethod
 * @description Creates an Effect-returning function from an asynchronous method of a service
 *              identified by a `Context.Tag`.
 * @template SourcedTagInstance The `Context.Tag` instance for the service.
 * @template SourcedService The service interface type, inferred from SourcedTagInstance.
 * @template Method The name of the asynchronous method on the service.
 * @template Arguments The arguments tuple type of the method.
 * @template Value The success value type of the method's Promise.
 * @template ErrorData Additional static data for error creation.
 * @template ErrorType The custom error type produced by `CreateProblem`.
 * @param ServiceTag The `Context.Tag` instance for the service.
 * @param MethodName The name of the method to wrap.
 * @param CreateProblem A function to create a custom error from a cause.
 * @param StaticData Static data to be included in the error.
 * @returns A function that, when called with method arguments, returns an Effect
 *          requiring the SourcedTagInstance in its context.
 */
export default function FromMethod<
	SourcedTagInstance extends Context.Tag<any, any>, // The Tag instance, e.g., HostServiceTag
	SourcedService extends Context.Tag.Service<SourcedTagInstance>, // The service interface, e.g., PerformAction
	Method extends {
		// Extracts keys of SourcedService that are async methods
		[Key in keyof SourcedService]: SourcedService[Key] extends (
			...args: any[]
		) => Promise<any>
			? Key
			: never;
	}[keyof SourcedService],
	// Infers arguments of the selected method
	Arguments extends SourcedService[Method] extends (
		...args: infer Args
	) => Promise<any>
		? Args
		: never,
	// Infers the resolved value type of the selected method's Promise
	Value extends SourcedService[Method] extends (
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
	ServiceTag: SourcedTagInstance, // e.g. HostServiceTag (which is Tag<PerformAction, PerformAction>)
	MethodName: Method,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (
	...args: Arguments
	// The Effect requires the Tag itself as R (its context requirement)
) => Effect.Effect<Value, ErrorType, SourcedTagInstance> {
	return (...args: Arguments) =>
		// Effect.flatMap(Tag, callback) provides the service instance to the callback.
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedService) => {
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
					} as { readonly cause: unknown } & ErrorData), // Ensure type for CreateProblem
			});
		});
}
