/**
 * @module Error (Application/WebViewPanel)
 * @description Defines domain-specific, tagged errors for webview panel operations.
 */
declare const WebViewPanelProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "WebViewPanelProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a webview panel operation, such as
 * failing to create a panel via the host or an error during its lifecycle.
 */
export declare class WebViewPanelProblem extends WebViewPanelProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map