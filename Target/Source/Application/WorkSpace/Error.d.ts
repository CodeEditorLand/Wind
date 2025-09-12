/**
 * @module Error (Application/WorkSpace)
 * @description Defines domain-specific, tagged errors for workspace operations.
 */
declare const WorkSpaceProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "WorkSpaceProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs within the `WorkspaceService`, for example,
 * an error during the initialization of the workspace context.
 */
export declare class WorkSpaceProblem extends WorkSpaceProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map