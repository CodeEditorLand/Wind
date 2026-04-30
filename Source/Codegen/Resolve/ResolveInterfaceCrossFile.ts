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

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { ExtractInterfaceMembers } from "../Extract/ExtractInterfaceMembers.js";
import type { InterfaceMemberRecord } from "../Type/InterfaceMemberRecord.js";

const ImportLinePattern =
	/import\s*(?:type\s*)?\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;

const ParseImportSpecifiers = (
	importBlock: string,
): ReadonlyArray<string> => {
	return importBlock
		.split(",")
		.map((entry) => {
			const Trimmed = entry.trim();
			if (Trimmed.length === 0) return "";
			const AsMatch = /(\w+)\s+as\s+(\w+)/.exec(Trimmed);
			return AsMatch ? AsMatch[1]! : Trimmed;
		})
		.filter((entry) => entry.length > 0);
};

const FindImportSource = (
	source: string,
	interfaceName: string,
): string | null => {
	ImportLinePattern.lastIndex = 0;
	let Match: RegExpExecArray | null;
	while ((Match = ImportLinePattern.exec(source)) !== null) {
		const Specifiers = ParseImportSpecifiers(Match[1] ?? "");
		if (Specifiers.includes(interfaceName)) {
			return Match[2] ?? null;
		}
	}
	return null;
};

const NormaliseImportPath = (
	currentFile: string,
	importPath: string,
): string => {
	if (importPath.endsWith(".ts")) return importPath;
	if (importPath.endsWith(".js")) {
		return importPath.slice(0, -3) + ".ts";
	}
	return importPath + ".ts";
};

export interface ResolveOptions {
	readonly InterfaceName: string;
	readonly DecoratorFilePath: string;
	readonly DecoratorFileContents: string;
}

export interface ResolveOutcome {
	readonly Members: ReadonlyArray<InterfaceMemberRecord>;
	readonly ResolvedFromPath: string;
}

export const ResolveInterfaceCrossFile = async (
	options: ResolveOptions,
): Promise<ResolveOutcome | null> => {
	const ImportPath = FindImportSource(
		options.DecoratorFileContents,
		options.InterfaceName,
	);
	if (!ImportPath) return null;

	const SourceDir = dirname(options.DecoratorFilePath);
	const Resolved = NormaliseImportPath(
		options.DecoratorFilePath,
		ImportPath.startsWith(".") ? join(SourceDir, ImportPath) : ImportPath,
	);
	const AbsolutePath = resolve(Resolved);

	let Contents: string;
	try {
		Contents = await readFile(AbsolutePath, "utf8");
	} catch {
		return null;
	}

	const Members = ExtractInterfaceMembers(Contents, options.InterfaceName);
	if (Members.length === 0) return null;

	return {
		Members,
		ResolvedFromPath: AbsolutePath,
	};
};

export default ResolveInterfaceCrossFile;
