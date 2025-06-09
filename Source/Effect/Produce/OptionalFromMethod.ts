/*
 * File: Wind/Source/Effect/Produce/OptionalFromMethod.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:31:43 UTC
 * Dependency: ./Type.js, effect
 * Export: OptionalFromMethod
 */

// Effect/Produce/OptionalFromMethod.ts
import { Context, Effect, Option, type Cause } from "effect";

import type { ErrorProducer } from "./Type.js";

export default function OptionalFromMethod<
	SourcedTagInstance extends Context.Tag<any, any>,
	SourcedService extends Context.Tag.Service<SourcedTagInstance>,
	SourcedIdentifier extends Context.Tag.Identifier<SourcedTagInstance>,
	Method extends {
		// Extracts keys of SourcedService that are async methods resolving to V | null | undefined
		[Key in keyof SourcedService]: SourcedService[Key] extends (
			...args: any[]
			// Method can resolve to null/undefined
		) => Promise<any | null | undefined>
			? Key
			: never;
	}[keyof SourcedService],
	Argument extends SourcedService[Method] extends (
		...args: infer A
	) => Promise<any | null | undefined>
		? A
		: never,
	Value extends SourcedService[Method] extends (
		...args: any[]
	) => Promise<infer R | null | undefined>
		? NonNullable<R>
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
): (...args: Argument) => Effect.Effect<
	Option.Option<Value>,
	ErrorType,
	SourcedIdentifier // Effect requires the Identifier type of the Tag
> {
	return (...args: Argument) =>
		Effect.flatMap(ServiceTag, (ServiceInstance: SourcedService) => {
			const Operation = (ServiceInstance as any)[MethodName] as (
				...opArgument: Argument
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
