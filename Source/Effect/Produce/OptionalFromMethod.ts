// Effect/Produce/OptionalFromMethod.ts
import { Context, Effect, Option, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

/**
 * @module OptionalFromMethod
 * @description Creates an Effect<Option<Value>> from an async service method that might resolve to null/undefined.
 *              The returned Effect requires the SourcedTagInstance in its context.
 * @template SourcedTagInstance The `Context.Tag` instance for the service.
 * @template SourcedService The service interface type, inferred from SourcedTagInstance.
 * @template Method The name of the async method.
 * @template Arguments The arguments tuple type of the method.
 * @template Value The non-nullable success value type of the method's Promise.
 * @template ErrorData Additional static data for error creation.
 * @template ErrorType The custom error type.
 * @param ServiceTag The `Context.Tag` instance for the service.
 * @param MethodName The name of the method to wrap.
 * @param CreateProblem A function to create a custom error.
 * @param StaticData Static data for the error.
 * @returns A function that returns an Effect yielding an Option of the method's result.
 */
export default function OptionalFromMethod<
	SourcedTagInstance extends Context.Tag<any, any>, // The Tag instance
	SourcedService extends Context.Tag.Service<SourcedTagInstance>, // The service interface
	Method extends {
		// Extracts keys of SourcedService that are async methods resolving to V | null | undefined
		[Key in keyof SourcedService]: SourcedService[Key] extends (
			...args: any[]
		) => Promise<any | null | undefined> // Method can resolve to null/undefined
			? Key
			: never;
	}[keyof SourcedService],
	Arguments extends SourcedService[Method] extends (
		...args: infer Args
	) => Promise<any | null | undefined>
		? Args
		: never,
	// Value is NonNullable, as Option.fromNullable will handle null/undefined
	Value extends SourcedService[Method] extends (
		...args: any[]
	) => Promise<infer Res | null | undefined>
		? NonNullable<Res> // Ensure Value is not nullable itself
		: never,
	ErrorData extends Record<string, any>,
	ErrorType extends Cause.YieldableError & {
		readonly _tag: string;
		readonly cause: unknown;
	} & ErrorData,
>(
	ServiceTag: SourcedTagInstance,
	MethodName: Method,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Arguments) => Effect.Effect<
	Option.Option<Value>, // The Effect yields an Option
	ErrorType,
	SourcedTagInstance // Effect requires the Tag itself as R
> {
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedService) => {
			const Operation = (ServiceInstance as any)[MethodName] as (
				...opArgs: Arguments
			) => Promise<Value | null | undefined>; // Promise can be Value, null, or undefined

			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),
				catch: (cause) =>
					CreateProblem({ ...StaticData, cause } as {
						readonly cause: unknown;
					} & ErrorData),
			}).pipe(Effect.map(Option.fromNullable)); // Convert null/undefined result to Option.none()
		});
}
