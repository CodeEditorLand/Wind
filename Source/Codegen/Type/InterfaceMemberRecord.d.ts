/**
 * @module Codegen/Type/InterfaceMemberRecord
 * @description
 * Strongly-typed record of a single member declared on a VS Code
 * service interface. Used by the schema emitter to construct
 * Wind-side bridge shapes that mirror upstream verbatim.
 * @category Type
 */
export type InterfaceMemberKind = "Property" | "Method" | "Event" | "Getter" | "Setter" | "Index";
export interface InterfaceMemberParameter {
    readonly Name: string;
    readonly TypeText: string;
    readonly Optional: boolean;
}
export interface InterfaceMemberRecord {
    readonly Kind: InterfaceMemberKind;
    readonly Name: string;
    readonly Readonly: boolean;
    readonly Optional: boolean;
    readonly TypeText: string;
    readonly Parameters: ReadonlyArray<InterfaceMemberParameter>;
    readonly DocComment: string | null;
    readonly SourceLine: number;
}
//# sourceMappingURL=InterfaceMemberRecord.d.ts.map