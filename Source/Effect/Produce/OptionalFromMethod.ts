// Effect/Produce/OptionalFromMethod.ts

import { Context, Effect, Option, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

export default function OptionalFromMethod<
	SourcedInterface,
	SourcedTag extends Context.Tag<SourcedInterface, SourcedInterface>,
	Method extends {
		[Key in keyof SourcedInterface]: SourcedInterface[Key] extends (
			...args: any[]
		) => Promise<any | null | undefined>
			? Key
			: never;
	}[keyof SourcedInterface],
	Arguments extends SourcedInterface[Method] extends (
		...args: infer Args
	) => Promise<any | null | undefined>
		? Args
		: never,
	Value extends SourcedInterface[Method] extends (
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
) => Effect.Effect<
	Option.Option<Value>,
	ErrorType,
	Context.Tag.Service<SourcedTag>
> {
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance) => {
			const Operation = (ServiceInstance as any)[MethodName] as (
				// Cast ServiceInstance
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
