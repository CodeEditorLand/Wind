// Effect/Produce/FromMethod.ts
import { Context, Effect, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

export default function FromMethod<
	SourcedTagInstance extends Context.Tag<any, any>, // The Tag instance, e.g., HostServiceTag
	SourcedService extends Context.Tag.Service<SourcedTagInstance>, // The service interface, e.g., PerformAction
	SourcedIdentifier extends Context.Tag.Identifier<SourcedTagInstance>, // The Identifier type, e.g., PerformAction
	Method extends {
		[Key in keyof SourcedService]: SourcedService[Key] extends (
			...args: any[]
		) => Promise<any>
			? Key
			: never;
	}[keyof SourcedService],
	Argument extends SourcedService[Method] extends (
		...args: infer Argument
	) => Promise<any>
		? Argument
		: never,
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
	ServiceTag: SourcedTagInstance,
	MethodName: Method,
	CreateProblem: ErrorProducer<ErrorData, ErrorType>,
	StaticData: ErrorData,
): (...args: Argument) => Effect.Effect<Value, ErrorType, SourcedIdentifier> {
	// Effect requires the Identifier type of the Tag
	return (...args: Argument) =>
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedService) => {
			const Operation = (ServiceInstance as any)[MethodName] as (
				...opArgument: Argument
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
