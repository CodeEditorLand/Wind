/**
 * @module Error (Application/Editor)
 * @description Defines a domain-specific, tagged error for editor operations
 * at the application layer.
 */
import type { HostServiceProblem } from "../Host/Error.js";
declare const EditorProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "EditorProblem";
} & Readonly<A>;
/**
 * Represents a failure within the `EditorService`.
 * This error is used to wrap failures that occur during editor operations,
 * such as failing to resolve an editor input or an error from the host service
 * when trying to open a file.
 */
export declare class EditorProblem extends EditorProblem_base<{
    readonly Cause: HostServiceProblem | Error;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map