// Effect/Produce/FromMethod.ts

// Removed 'Tag' as it's not directly used from here
import { Context, Effect, type Cause } from "effect";

// Use type aggregator
import type { ErrorProducer } from "./Type.js";

/**
 * @module FromMethod
 * @description Creates an Effect by calling a method on a service from Context.
 */
export default function FromMethod<
	// Not strictly needed if SourcedTag is correctly typed
	// Identifier,

	// The service interface type
	Interface,
	// Tag for the service
	SourcedTag extends Context.Tag<Interface, Interface>,
	Method extends {
		[Key in keyof Interface]: Interface[Key] extends (
			...args: any[]
		) => Promise<any>
			? Key
			: never;
	}[keyof Interface],
	Arguments extends Interface[Method] extends (
		...args: infer Args
	) => Promise<any>
		? Args
		: never,
	Value extends Interface[Method] extends (
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
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance) => {
			const Operation = ServiceInstance[MethodName] as (
				...opArgs: Arguments
			) => Promise<Value>;

			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),

				catch: (cause) =>
					CreateProblem({
						...StaticData,

						cause,
					} as { readonly cause: unknown } & ErrorData),
			});
		});
}
