/**
 * @module Codegen/Extract/ExtractInterfaceMembers
 * @description
 * Regex + bracket-balanced extractor for an interface declaration's
 * members. Given the source of a `.ts` file and a target interface
 * name, returns the typed list of members (properties, methods,
 * events) annotated with parameters, optionality, and JSDoc.
 *
 * The extractor stays regex-based for the same reasons as
 * `ExtractDecoratorMatch`: zero additional deps inside Wind's
 * codegen pipeline. The brace-balancing routine is dependency-free
 * and tolerates nested generics and union types.
 * @category Extract
 */
import type { InterfaceMemberRecord } from "../Type/InterfaceMemberRecord.js";

export declare const ExtractInterfaceMembers: (
	source: string,

	interfaceName: string,
) => ReadonlyArray<InterfaceMemberRecord>;

export default ExtractInterfaceMembers;

//# sourceMappingURL=ExtractInterfaceMembers.d.ts.map
