/**
 * @module Error (Application/Storage)
 * @description Defines domain-specific, tagged errors for storage
 * operations at the application layer.
 */
declare const StorageProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "StorageProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during a storage operation, such as failing
 * to initialize a database or write a value. It wraps lower-level errors.
 */
export declare class StorageProblem extends StorageProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
