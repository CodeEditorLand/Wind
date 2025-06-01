// Effect/Produce/OptionalFromMethod.ts

import { Context, Effect, Option, type Cause, type Tag } from "effect";

// Use type aggregator
import type { ErrorProducer } from "./Type.js";

/**
 * @module OptionalFromMethod
 * @description Creates an Effect<Option<Value>> from a service method that might return a nullable Promise.
 */
export default function OptionalFromMethod<
	Identifier,
	Interface,
	SourcedTag extends Context.Tag<Identifier, Interface>,
	Method extends {
		[Key in keyof Interface]: Interface[Key] extends (
			...args: any[]
		) => Promise<any | null | undefined>
			? Key
			: never;
	}[keyof Interface],
	Arguments extends Interface[Method] extends (
		...args: infer Args
	) => Promise<any | null | undefined>
		? Args
		: never,
	Value extends Interface[Method] extends (
		...args: any[]
	) => Promise<infer Res | null | undefined>
		? NonNullable<Res>
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
) => Effect.Effect<Option.Option<Value>, ErrorType, Tag.Service<SourcedTag>> {
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance) => {
			const Operation = ServiceInstance[MethodName] as (
				...opArgs: Arguments
			) => Promise<Value | null | undefined>;

			return Effect.tryPromise({
				try: () => Operation.apply(ServiceInstance, args),

				catch: (cause) =>
					CreateProblem({ ...StaticData, cause } as {
						readonly cause: unknown;
					} & ErrorData),
			}).pipe(Effect.map(Option.fromNullable));
		});
}
