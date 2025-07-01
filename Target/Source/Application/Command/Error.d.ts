/**
 * @module Error (Application/Command)
 * @description Defines domain-specific, tagged errors for command operations.
 */
declare const CommandProblem_base: new <A extends Record<string, any> = {}>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "CommandProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs when executing or registering a command.
 * This can wrap errors from the IPC layer or represent issues like an
 * unknown command being invoked.
 */
export declare class CommandProblem extends CommandProblem_base<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
export {};
