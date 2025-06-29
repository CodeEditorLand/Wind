/**
 * @module Error (Application/Clipboard)
 * @description Defines a domain-specific, tagged error for clipboard operations
 * at the application layer. This provides a structured way to handle failures
 * specific to the clipboard domain.
 */
import type { IntegrationClipboardProblem } from "../../Integration/Tauri/Clipboard/Error.js";
declare const ApplicationClipboardProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationClipboardProblem";
} & Readonly<A>;
/**
 * Represents a failure within the `Clipboard` application service.
 *
 * This error acts as a wrapper around a more specific problem from the
 * Integration layer (e.g., a failure to communicate with the native host).
 * This allows higher-level application code to catch a single, well-defined
 * error type for this domain, while still preserving the original `Cause` for
 * detailed logging and debugging purposes.
 */
export declare class ApplicationClipboardProblem extends ApplicationClipboardProblem_base<{
    /** The underlying problem from the Integration layer that caused this failure. */
    readonly Cause: IntegrationClipboardProblem;
}> {
}
export {};
