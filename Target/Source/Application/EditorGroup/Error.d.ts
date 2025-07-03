/**
 * @module Error (Application/EditorGroup)
 * @description Defines a domain-specific, tagged error for editor group
 * operations at the application layer.
 */
declare const EditorGroupProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "EditorGroupProblem";
} & Readonly<A>;
/**
 * Represents a failure within the `EditorGroup` application service.
 * This can be used to wrap errors from underlying services or to represent
 * invalid state transitions, such as attempting to remove the last editor group.
 */
export declare class EditorGroupProblem extends EditorGroupProblem_base<{
    readonly Cause?: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map