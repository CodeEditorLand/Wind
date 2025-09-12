/**
 * @module Error (Application/Document)
 * @description Defines domain-specific, tagged errors for document operations
 * at the application layer.
 */
declare const DocumentNotFoundProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "DocumentNotFoundProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs when a requested document cannot be found.
 */
export declare class DocumentNotFoundProblem extends DocumentNotFoundProblem_base<{
    readonly Uri: string;
}> {
}
declare const ContentProviderProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ContentProviderProblem";
} & Readonly<A>;
/**
 * Represents a failure during the registration of a content provider.
 */
export declare class ContentProviderProblem extends ContentProviderProblem_base<{
    readonly Cause: unknown;
    readonly Scheme: string;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map