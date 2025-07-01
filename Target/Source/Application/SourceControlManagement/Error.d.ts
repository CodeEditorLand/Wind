/**
 * @module Error (Application/SourceControlManagement)
 * @description Defines domain-specific, tagged errors for Source Control Management
 * operations at the application layer.
 */
declare const SourceControlManagementProblem_base: new <
	A extends Record<string, any> = {},
>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "SourceControlManagementProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during an SCM operation, such as failing
 * to fetch the initial state from the host or an error during an update event.
 */
export declare class SourceControlManagementProblem extends SourceControlManagementProblem_base<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
export {};
