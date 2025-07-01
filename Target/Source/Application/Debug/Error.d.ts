/**
 * @module Error (Application/Debug)
 * @description Defines domain-specific, tagged errors for debugging operations.
 */
declare const DebugProviderRegistrationProblem_base: new <
	A extends Record<string, any> = {},
>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "DebugProviderRegistrationProblem";
} & Readonly<A>;
/**
 * Represents a failure during the registration of a debug provider.
 */
export declare class DebugProviderRegistrationProblem extends DebugProviderRegistrationProblem_base<{
	readonly DebugType: string;
	readonly Cause?: unknown;
}> {}
declare const StartDebuggingProblem_base: new <
	A extends Record<string, any> = {},
>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "StartDebuggingProblem";
} & Readonly<A>;
/**
 * Represents a failure when attempting to start a debugging session.
 */
export declare class StartDebuggingProblem extends StartDebuggingProblem_base<{
	readonly Cause: unknown;
}> {}
export {};
