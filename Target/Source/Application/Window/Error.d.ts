/**
 * @module Error (Application/Window)
 * @description Defines domain-specific, tagged errors for window operations.
 */
declare const WindowProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "WindowProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs within the `WindowService`, for example, when
 * failing to show a text document because the host could not find a corresponding editor.
 */
export declare class WindowProblem extends WindowProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map