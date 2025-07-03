/**
 * @module Error (Integration/Tauri/Configuration)
 * @description Defines a tagged error for configuration-related failures at
 * the integration layer.
 */
declare const IntegrationConfigurationProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "IntegrationConfigurationProblem";
} & Readonly<A>;
/**
 * Represents a failure when interacting with configuration at the integration
 * level, for example, failing to parse a JSON file read from disk.
 */
export declare class IntegrationConfigurationProblem extends IntegrationConfigurationProblem_base<{
    readonly Cause?: unknown;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map