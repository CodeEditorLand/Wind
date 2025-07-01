/**
 * @module Error (Application/TreeView)
 * @description Defines domain-specific, tagged errors for TreeView operations
 * at the application layer.
 */
declare const TreeViewProblem_base: new <A extends Record<string, any> = {}>(
	args: import("effect/Types").Equals<A, {}> extends true
		? void
		: { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P] },
) => import("effect/Cause").YieldableError & {
	readonly _tag: "TreeViewProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs when a TreeView operation fails, such as
 * failing to fetch children for a tree item from the native host.
 */
export declare class TreeViewProblem extends TreeViewProblem_base<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
export {};
