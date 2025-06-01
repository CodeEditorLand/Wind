// Effect/Produce/FromMethod.ts

import { Context, Effect, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

export default function FromMethod<
	// The service interface type
	SourcedInterface,
	// Tag for the service
	SourcedTag extends Context.Tag<SourcedInterface, SourcedInterface>,
	Method extends {
		[Key in keyof SourcedInterface]: SourcedInterface[Key] extends (
			...args: any[]
		) => Promise<any>
			? Key
			: never;
	}[keyof SourcedInterface],
	Arguments extends SourcedInterface[Method] extends (
		...args: infer Args
	) => Promise<any>
		? Args
		: never,
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
	// Service type from Tag
	return (...args: Arguments) =>
		Effect.flatMap(ServiceTag, (ServiceInstance) => {
			// ServiceInstance here should be of type SourcedInterface
			const Operation = (ServiceInstance as any)[MethodName] as (
				// Cast ServiceInstance to any for method access
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
