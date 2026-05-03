/**
 * @module Codegen/Extract/IterateServiceDecorators
 * @description
 * Async iterator that walks the VS Code source tree and yields one
 * `ServiceDecoratorRecord` per `createDecorator(...)` site. Combines
 * `WalkSourceTree` with `ExtractDecoratorMatches` and:
 *   1. Inline interface extraction (when interface lives in the same
 *      file as the decorator).
 *   2. Cross-file resolution via `ResolveInterfaceCrossFile` when the
 *      interface is imported from a sibling module.
 *
 * The iterator is the single ground-truth surface the schema
 * emitter consumes. Every record carries the source path + line
 * number so the emitted Wind-side schema can include a back-link
 * comment pointing developers at the upstream declaration.
 * @category Extract
 */

import { ResolveInterfaceCrossFile } from "../Resolve/ResolveInterfaceCrossFile.js";
import type { InterfaceMemberRecord } from "../Type/InterfaceMemberRecord.js";
import type { ServiceDecoratorRecord } from "../Type/ServiceDecoratorRecord.js";
import type { SourceFile } from "../Walk/SourceTreeWalker.js";
import { ExtractDecoratorMatches } from "./ExtractDecoratorMatch.js";
import { ExtractInterfaceMembers } from "./ExtractInterfaceMembers.js";

const FindInterfaceDocComment = (
	source: string,
	interfaceName: string,
): string | null => {
	const Pattern = new RegExp(
		`((?:\\s*\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)*)(?:export\\s+)?interface\\s+${interfaceName}\\b`,
	);
	const Match = Pattern.exec(source);
	if (!Match) return null;
	const DocBlock = /\/\*\*([\s\S]*?)\*\//.exec(Match[1] ?? "");
	if (!DocBlock) return null;
	return (DocBlock[1] ?? "")
		.split(/\r?\n/)
		.map((line) =>
			line
				.replace(/^\s*\/?\*+\/?/, "")
				.replace(/\*+\/?$/, "")
				.trim(),
		)
		.filter((line) => line.length > 0)
		.join("\n");
};

const ResolveMembersForRecord = async (
	file: SourceFile,
	interfaceName: string,
): Promise<{
	readonly Members: ReadonlyArray<InterfaceMemberRecord>;
	readonly DocComment: string | null;
}> => {
	const InlineMembers = ExtractInterfaceMembers(file.Contents, interfaceName);
	if (InlineMembers.length > 0) {
		return {
			Members: InlineMembers,
			DocComment: FindInterfaceDocComment(file.Contents, interfaceName),
		};
	}
	const CrossFile = await ResolveInterfaceCrossFile({
		InterfaceName: interfaceName,
		DecoratorFilePath: file.AbsolutePath,
		DecoratorFileContents: file.Contents,
	});
	if (CrossFile) {
		return {
			Members: CrossFile.Members,
			DocComment: null,
		};
	}
	return {
		Members: [],
		DocComment: null,
	};
};

export const IterateServiceDecorators = async function* (
	files: AsyncIterable<SourceFile>,
): AsyncIterableIterator<ServiceDecoratorRecord> {
	for await (const File of files) {
		const Matches = ExtractDecoratorMatches(File.Contents);
		if (Matches.length === 0) continue;
		for (const Match of Matches) {
			const Resolved = await ResolveMembersForRecord(
				File,
				Match.InterfaceName,
			);
			yield {
				DecoratorName: Match.DecoratorName,
				DecoratorTag: Match.DecoratorTag,
				InterfaceName: Match.InterfaceName,
				SourcePath: File.SourcePath,
				SourceLine: Match.SourceLine,
				Members: Resolved.Members,
				DecoratorDocComment: Match.DocComment,
				InterfaceDocComment: Resolved.DocComment,
			};
		}
	}
};

export default IterateServiceDecorators;
