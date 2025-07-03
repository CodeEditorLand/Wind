/**
 * @module Error (Application/LanguageFeature)
 * @description Defines domain-specific, tagged errors for language feature
 * provider registration.
 */
declare const ProviderRegistrationProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "ProviderRegistrationProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs during the registration of a language
 * feature provider.
 */
export declare class ProviderRegistrationProblem extends ProviderRegistrationProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
//# sourceMappingURL=Error.d.ts.map