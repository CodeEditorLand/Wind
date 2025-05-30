// Effect/Produce/FromMethod.ts

import { Context, Effect, type Data } from "effect";

import type { ErrorProducer } from "./Type.js"; // Use type aggregator

/**
 * @module FromMethod
 * @description Creates an Effect by calling a method on a service from Context.
 */
export default function FromMethod<
	Interface,
	Identifier,
	Tag extends Context.Tag<Identifier, Interface>,
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
	ErrorType extends Data.TaggedError<string, { cause: unknown } & ErrorData>,
>(
	ServiceTag: Tag,
	MethodName: Method,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Arguments) => Effect.Effect<Value, ErrorType, Interface> {
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance) => {
			const Operation = ServiceInstance[MethodName] as (
				...opArgs: Arguments
			) => Promise<Value>;
			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),
				catch: (cause) =>
					CreateProblem({ ...StaticData, cause } as {
						cause: unknown;
					} & ErrorData),
			});
		});
}
