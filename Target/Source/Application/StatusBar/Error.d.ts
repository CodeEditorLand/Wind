/**
 * @module Error (Application/StatusBar)
 * @description Defines domain-specific, tagged errors for status bar operations.
 */
declare const StatusBarProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "StatusBarProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a status bar operation, such as
 * failing to create or update a status bar item via the host.
 */
export declare class StatusBarProblem extends StatusBarProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
