/**
 * @module Error (Application/Host)
 * @description Defines a domain-specific, tagged error for host-level operations
 * at the application layer.
 */
declare const HostServiceProblem_base: new <A extends Record<string, any> = {}>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "HostServiceProblem";
} & Readonly<A>;
/**
 * Represents a failure within the `HostService`.
 *
 * This error is used to wrap failures that occur during critical startup
 * operations, such as fetching initial configuration from the native host, or
 * during interactions like showing native dialogs.
 */
export declare class HostServiceProblem extends HostServiceProblem_base<{
	/** The underlying error or reason for the failure. */
	readonly Cause: unknown;
	/** A string describing the context of the operation. */
	readonly Context: string;
}> {}
export {};
