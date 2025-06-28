/**
 * @module Error (Application/QuickInput)
 * @description Defines a domain-specific, tagged error for Quick Input
 * operations at the application layer.
 */
import type { HostServiceProblem } from "Source/Application/Host/Error.js";
declare const QuickInputProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "QuickInputProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a Quick Input operation, such as
 * showing a Quick Pick or an Input Box. It wraps lower-level errors.
 */
export declare class QuickInputProblem extends QuickInputProblem_base<{
    readonly Cause: HostServiceProblem | Error;
    readonly Context: string;
}> {
}
export {};
