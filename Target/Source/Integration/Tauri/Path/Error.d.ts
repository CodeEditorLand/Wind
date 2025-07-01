/**
 * @module Error (Integration/Tauri/Path)
 * @description Defines a tagged error for path-resolution failures at the
 * integration layer.
 */
declare const IntegrationPathProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "IntegrationPathProblem";
} & Readonly<A>;
/**
 * Represents a failure when resolving a filesystem path via the Tauri API.
 */
export declare class IntegrationPathProblem extends IntegrationPathProblem_base<{
    readonly Cause?: unknown;
}> {
}
export {};
