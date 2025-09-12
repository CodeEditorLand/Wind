/**
 * @module Error (Application/TextEditor)
 * @description Defines domain-specific, tagged errors for text editor (file model)
 * operations at the application layer.
 */
import type { HostServiceProblem } from "../Host/Error.js";
declare const TextEditorProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "TextEditorProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during text file operations, such as saving a file.
 * It wraps lower-level errors to provide a consistent error type for the application.
 */
export declare class TextEditorProblem extends TextEditorProblem_base<{
    readonly Cause: HostServiceProblem | Error;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map