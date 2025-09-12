/**
 * @module Error (Application/File)
 * @description Defines domain-specific, tagged errors for file operations
 * at the application layer.
 */
declare const FileProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "FileProblem";
} & Readonly<A>;
/**
 * Represents a generic failure within the `FileService`.
 * This can be used to wrap lower-level errors (e.g., from a file system provider)
 * to provide a consistent error type for the application to handle.
 */
export declare class FileProblem extends FileProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map