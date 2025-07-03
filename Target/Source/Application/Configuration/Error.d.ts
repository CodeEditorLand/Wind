/**
 * @module Error (Application/Configuration)
 * @description Defines a domain-specific, tagged error for configuration
 * operations at the application layer.
 */
import type { IntegrationConfigurationProblem } from "../../Integration/Tauri/Configuration/Error.js";
import type { IntegrationPathProblem } from "../../Integration/Tauri/Path/Error.js";
declare const ApplicationConfigurationProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationConfigurationProblem";
} & Readonly<A>;
/**
 * Represents a failure within the `Configuration` application service.
 *
 * This error acts as a wrapper around more specific problems from the
 * Integration layer (e.g., file system or path resolution errors). This allows
 * higher-level code to catch a single, well-defined error type for this domain,
 * while preserving the original cause for detailed logging and debugging.
 */
export declare class ApplicationConfigurationProblem extends ApplicationConfigurationProblem_base<{
    /** The underlying problem from the Integration layer that caused this failure. */
    readonly Cause: IntegrationConfigurationProblem | IntegrationPathProblem;
    /** A string describing the context of the operation (e.g., 'FailedToResolveConfiguration'). */
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map