/**
 * @module Error (Application/Log)
 * @description Defines domain-specific, tagged errors for logging
 * operations at the application layer.
 */
declare const LogProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "LogProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a logging operation, such as the
 * inability to forward a log message to the native host.
 */
export declare class LogProblem extends LogProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
