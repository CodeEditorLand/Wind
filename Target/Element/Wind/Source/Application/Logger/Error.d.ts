/**
 * @module Error (Application/Logger)
 * @description Defines domain-specific, tagged errors for logging
 * operations at the application layer.
 */
declare const LoggerProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "LoggerProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a logging operation, such as the
 * inability to forward a log message to the native host.
 */
export declare class LoggerProblem extends LoggerProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
