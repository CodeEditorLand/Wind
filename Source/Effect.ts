import { Context, Data, Effect, Option } from "effect";

/**
 * A function that returns a Promise.
 * @template Args - Tuple type of arguments for the promise-returning function.
 * @template R - Success type of the Promise.
 */
type PromiseProvider<Args extends any[], R> = (...args: Args) => Promise<R>;

/**
 * A constructor for a custom Data.TaggedError.
 * @template PErrorPayload - The payload properties specific to this error, excluding 'cause'.
 * @template TEffectError - The custom error type, extends Data.TaggedError.
 */
type ErrorFactory<
	PErrorPayload extends Record<string, any>, // Properties specific to this error (excluding cause)
	TEffectError extends Data.TaggedError<
		string,
		{ cause: unknown } & PErrorPayload
	>,
> = (props: { cause: unknown } & PErrorPayload) => TEffectError;

/**
 * Creates a function that wraps a standard promise-returning API call into an Effect.
 * The generated function will take the same arguments as the original API.
 */
export function makeEffectFromPromise<
	Args extends any[],
	R,
	PErrorPayload extends Record<string, any>,
	TEffectError extends Data.TaggedError<
		string,
		{ cause: unknown } & PErrorPayload
	>,
>(
	apiFn: PromiseProvider<Args, R>,
	errorFactory: ErrorFactory<PErrorPayload, TEffectError>,
	staticErrorPayload: PErrorPayload,
): (...args: Args) => Effect.Effect<R, TEffectError> {
	return (...args: Args) =>
		Effect.tryPromise({
			try: () => apiFn(...args),
			catch: (cause) =>
				errorFactory({ ...staticErrorPayload, cause } as {
					cause: unknown;
				} & PErrorPayload),
		});
}

/**
 * Creates a function that wraps a promise-returning API (that might return null/undefined for "not found")
 * into an Effect that yields an Option.
 */
export function makeEffectOptionFromPromise<
	Args extends any[],
	R, // The non-nullable success type
	PErrorPayload extends Record<string, any>,
	TEffectError extends Data.TaggedError<
		string,
		{ cause: unknown } & PErrorPayload
	>,
>(
	apiFn: PromiseProvider<Args, R | null | undefined>,
	errorFactory: ErrorFactory<PErrorPayload, TEffectError>,
	staticErrorPayload: PErrorPayload,
): (...args: Args) => Effect.Effect<Option.Option<R>, TEffectError> {
	return (...args: Args) =>
		Effect.tryPromise({
			try: () => apiFn(...args),
			catch: (cause) =>
				errorFactory({ ...staticErrorPayload, cause } as {
					cause: unknown;
				} & PErrorPayload),
		}).pipe(Effect.map(Option.fromNullable));
}

/**
 * Creates a function that wraps a call to a method of a service retrieved from Effect's Context.
 */
export function makeEffectFromServiceMethod<
	S_Interface,
	S_Identifier,
	S_Tag extends Context.Tag<S_Identifier, S_Interface>,
	MethodName extends {
		[K in keyof S_Interface]: S_Interface[K] extends (
			...args: any[]
		) => Promise<any>
			? K
			: never;
	}[keyof S_Interface],
	MethodArgs extends S_Interface[MethodName] extends (
		...args: infer A
	) => Promise<any>
		? A
		: never,
	MethodResult extends S_Interface[MethodName] extends (
		...args: any[]
	) => Promise<infer MR>
		? MR
		: never,
	PErrorPayload extends Record<string, any>,
	TEffectError extends Data.TaggedError<
		string,
		{ cause: unknown } & PErrorPayload
	>,
>(
	ServiceTag: S_Tag,
	methodName: MethodName,
	errorFactory: ErrorFactory<PErrorPayload, TEffectError>,
	staticErrorPayload: PErrorPayload,
): (
	...args: MethodArgs
) => Effect.Effect<MethodResult, TEffectError, S_Interface> {
	return (...args: MethodArgs) =>
		Effect.flatMap(ServiceTag, (service) => {
			const method = service[methodName] as (
				...mArgs: MethodArgs
			) => Promise<MethodResult>;
			return Effect.tryPromise({
				try: () => method.apply(service, args),
				catch: (cause) =>
					errorFactory({ ...staticErrorPayload, cause } as {
						cause: unknown;
					} & PErrorPayload),
			});
		});
}

/**
 * Creates a function that wraps a call to a service method (that might return null/undefined)
 * into an Effect that yields an Option.
 */
export function makeEffectOptionFromServiceMethod<
	S_Interface,
	S_Identifier,
	S_Tag extends Context.Tag<S_Identifier, S_Interface>,
	MethodName extends {
		[K in keyof S_Interface]: S_Interface[K] extends (
			...args: any[]
		) => Promise<any | null | undefined>
			? K
			: never;
	}[keyof S_Interface],
	MethodArgs extends S_Interface[MethodName] extends (
		...args: infer A
	) => Promise<any | null | undefined>
		? A
		: never,
	MethodResult extends S_Interface[MethodName] extends (
		...args: any[]
	) => Promise<infer MR | null | undefined>
		? NonNullable<MR>
		: never,
	PErrorPayload extends Record<string, any>,
	TEffectError extends Data.TaggedError<
		string,
		{ cause: unknown } & PErrorPayload
	>,
>(
	ServiceTag: S_Tag,
	methodName: MethodName,
	errorFactory: ErrorFactory<PErrorPayload, TEffectError>,
	staticErrorPayload: PErrorPayload,
): (
	...args: MethodArgs
) => Effect.Effect<Option.Option<MethodResult>, TEffectError, S_Interface> {
	return (...args: MethodArgs) =>
		Effect.flatMap(ServiceTag, (service) => {
			const method = service[methodName] as (
				...mArgs: MethodArgs
			) => Promise<MethodResult | null | undefined>;
			return Effect.tryPromise({
				try: () => method.apply(service, args),
				catch: (cause) =>
					errorFactory({ ...staticErrorPayload, cause } as {
						cause: unknown;
					} & PErrorPayload),
			}).pipe(Effect.map(Option.fromNullable));
		});
}
