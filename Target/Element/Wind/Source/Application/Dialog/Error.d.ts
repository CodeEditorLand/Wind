/**
 * @module Error (Application/Dialog)
 * @description Defines a domain-specific, tagged error for dialog operations
 * at the application layer.
 */
import type { HostServiceProblem } from "../Host/Error.js";
declare const DialogProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "DialogProblem";
} & Readonly<A>;
/**
 * Represents a failure within the Dialog application service.
 *
 * This error acts as a wrapper around a more specific problem from a lower-level
 * service, like the `HostService`. This allows higher-level code to catch a
 * single, well-defined error type for this domain while preserving the original
 * cause for detailed logging and debugging.
 */
export declare class DialogProblem extends DialogProblem_base<{
    /** The underlying problem that caused this failure. */
    readonly Cause: HostServiceProblem;
    /** A string describing the context of the operation (e.g., 'ShowOpenDialogFailed'). */
    readonly Context: string;
}> {
}
export {};
