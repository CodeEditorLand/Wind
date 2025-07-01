/**
 * @module Error (Application/Marker)
 * @description Defines domain-specific, tagged errors for marker service operations.
 */
declare const MarkerProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "MarkerProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs within the `MarkerService`, such as an
 * inability to set up event listeners or fetch diagnostic data from the host.
 */
export declare class MarkerProblem extends MarkerProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
