/**
 * @module Error (Integration/Tauri/Clipboard)
 * @description Defines a structured, tagged error for failures that occur when
 * interacting directly with the Tauri clipboard API.
 */
declare const IntegrationClipboardProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "IntegrationClipboardProblem";
} & Readonly<A>;
/**
 * Represents a failure at the lowest level of clipboard interaction.
 *
 * This error is created by the Effect wrappers in this integration layer when a
 * call to a Tauri clipboard command rejects. It captures the underlying cause
 * and the specific operation that failed for rich diagnostics.
 */
export declare class IntegrationClipboardProblem extends IntegrationClipboardProblem_base<{
    readonly Cause: unknown;
    readonly Operation: "ReadText" | "WriteText" | "ReadImage" | "WriteImage" | "ReadResourceList" | "WriteResourceList" | "HasResourceList";
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map