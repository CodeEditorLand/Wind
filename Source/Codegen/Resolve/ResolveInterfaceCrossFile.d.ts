/**
 * @module Codegen/Resolve/ResolveInterfaceCrossFile
 * @description
 * Cross-file interface resolver. When a `createDecorator` site
 * names an interface that is NOT declared in the same `.ts` file,
 * walks the file's `import` statements to find the source of the
 * named import, reads that file, and runs `ExtractInterfaceMembers`
 * on it.
 *
 * Consumed by `IterateServiceDecorators` as a fallback whenever
 * the in-file extraction yields zero members. Cross-file resolution
 * runs only on demand so codegen stays fast on the happy path
 * where decorator + interface live together.
 * @category Resolve
 */
import type { InterfaceMemberRecord } from "../Type/InterfaceMemberRecord.js";

export interface ResolveOptions {
	readonly InterfaceName: string;

	readonly DecoratorFilePath: string;

	readonly DecoratorFileContents: string;
}

export interface ResolveOutcome {
	readonly Members: ReadonlyArray<InterfaceMemberRecord>;

	readonly ResolvedFromPath: string;
}

export declare const ResolveInterfaceCrossFile: (
	options: ResolveOptions,
) => Promise<ResolveOutcome | null>;

export default ResolveInterfaceCrossFile;

//# sourceMappingURL=ResolveInterfaceCrossFile.d.ts.map
