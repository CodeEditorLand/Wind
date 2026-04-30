/**
 * @module Codegen/Extract/IterateServiceDecorators
 * @description
 * Async iterator that walks the VS Code source tree and yields one
 * `ServiceDecoratorRecord` per `createDecorator(...)` site. Combines
 * `WalkSourceTree` with `ExtractDecoratorMatches` and (when the
 * decorator's interface lives in the same file) inline interface
 * extraction. Cross-file interface resolution is a follow-up pass
 * driven by `ResolveInterfaceCrossFile.ts` (separate module).
 *
 * The iterator is the single ground-truth surface the schema
 * emitter consumes. Every record carries the source path + line
 * number so the emitted Wind-side schema can include a back-link
 * comment pointing developers at the upstream declaration.
 * @category Extract
 */

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

export const IterateServiceDecorators = async function* (
	files: AsyncIterable<SourceFile>,
): AsyncIterableIterator<ServiceDecoratorRecord> {
	for await (const File of files) {
		const Matches = ExtractDecoratorMatches(File.Contents);
		if (Matches.length === 0) continue;
		for (const Match of Matches) {
			const Members = ExtractInterfaceMembers(
				File.Contents,
				Match.InterfaceName,
			);
			yield {
				DecoratorName: Match.DecoratorName,
				DecoratorTag: Match.DecoratorTag,
				InterfaceName: Match.InterfaceName,
				SourcePath: File.SourcePath,
				SourceLine: Match.SourceLine,
				Members,
				DecoratorDocComment: Match.DocComment,
				InterfaceDocComment: FindInterfaceDocComment(
					File.Contents,
					Match.InterfaceName,
				),
			};
		}
	}
};

export default IterateServiceDecorators;
