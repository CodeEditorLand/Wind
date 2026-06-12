/**
 * @module Codegen/Resolve/ResolveInterfaceCrossFile
 * @description
 * Cross-file + heritage interface resolver. When a `createDecorator`
 * site names an interface whose same-file extraction yields zero
 * members, resolution proceeds in two directions:
 *
 *   1. Import-follow: walk the file's `import` statements to find the
 *      source of the named import, read that file, and extract there.
 *   2. Heritage-follow: when the interface IS declared in the current
 *      file but its body is empty (the upstream
 *      `interface X extends Y { }` re-export pattern, e.g.
 *      `INativeHostService extends ICommonNativeHostService { }`),
 *      parse the `extends` clause and resolve each parent - same-file
 *      inline first, then via imports.
 *
 * Both directions recurse (visited-set guarded, depth-capped) so a
 * chain like decorator-file → imported file → parent interface still
 * lands on concrete members. Inherited members are deduplicated by
 * name with own/earlier declarations winning. Parents that are
 * classes (not interfaces) stay unresolved - the emitter's
 * `// no members` comment remains the last resort for those.
 *
 * Consumed by `IterateServiceDecorators` as a fallback whenever
 * the in-file extraction yields zero members. Resolution runs only
 * on demand so codegen stays fast on the happy path where decorator
 * + interface live together.
 * @category Resolve
 */

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { ExtractInterfaceMembers } from "../Extract/ExtractInterfaceMembers.js";
import type { InterfaceMemberRecord } from "../Type/InterfaceMemberRecord.js";

const ImportLinePattern =
	/import\s*(?:type\s*)?\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;

const ParseImportSpecifiers = (importBlock: string): ReadonlyArray<string> => {
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

// Matches the interface declaration header in a file and captures the
// raw `extends …` clause (group 1) when present.
const InterfaceHeaderPattern = (interfaceName: string): RegExp =>
	new RegExp(
		`(?:export\\s+)?interface\\s+${interfaceName}(?:<[^>]+>)?(?:\\s+extends\\s+([^{]+))?\\s*\\{`,
	);

// Splits an `extends` clause on top-level commas (respecting generic
// argument nesting) and strips generic arguments from each parent
// name. Qualified names (`ns.Type`) are dropped - they cannot be
// resolved through the named-import walker.
const ParseHeritageNames = (clause: string): ReadonlyArray<string> => {
	const Parts: string[] = [];

	let Depth = 0;

	let Buffer = "";

	for (const Char of clause) {
		if (Char === "<") Depth += 1;
		else if (Char === ">") Depth = Math.max(0, Depth - 1);

		if (Char === "," && Depth === 0) {
			Parts.push(Buffer);

			Buffer = "";

			continue;
		}

		Buffer += Char;
	}

	Parts.push(Buffer);

	return Parts.map((entry) => entry.replace(/<[\s\S]*$/, "").trim()).filter(
		(entry) => /^[A-Za-z_$][\w$]*$/.test(entry),
	);
};

const DedupeByName = (
	members: ReadonlyArray<InterfaceMemberRecord>,
): ReadonlyArray<InterfaceMemberRecord> => {
	const Seen = new Set<string>();

	const Out: InterfaceMemberRecord[] = [];

	for (const Member of members) {
		if (Seen.has(Member.Name)) continue;

		Seen.add(Member.Name);

		Out.push(Member);
	}

	return Out;
};

const MaxResolutionDepth = 5;

const ResolveNamedMembers = async (
	interfaceName: string,

	filePath: string,

	fileContents: string,

	visited: Set<string>,

	depth: number,
): Promise<ResolveOutcome | null> => {
	if (depth > MaxResolutionDepth) return null;

	const Key = `${filePath}::${interfaceName}`;

	if (visited.has(Key)) return null;

	visited.add(Key);

	const Header = InterfaceHeaderPattern(interfaceName).exec(fileContents);

	if (Header) {
		// Declared in this file: own members + heritage parents.
		const Collected: InterfaceMemberRecord[] = [
			...ExtractInterfaceMembers(fileContents, interfaceName),
		];

		const HeritageClause = Header[1];

		if (HeritageClause) {
			for (const ParentName of ParseHeritageNames(HeritageClause)) {
				const Parent = await ResolveNamedMembers(
					ParentName,

					filePath,

					fileContents,

					visited,

					depth + 1,
				);

				if (Parent) {
					for (const Member of Parent.Members) {
						Collected.push(Member);
					}
				}
			}
		}

		const Members = DedupeByName(Collected);

		if (Members.length === 0) return null;

		return {
			Members,

			ResolvedFromPath: filePath,
		};
	}

	// Not declared here: follow the named import.
	const ImportPath = FindImportSource(fileContents, interfaceName);

	if (!ImportPath) return null;

	const SourceDir = dirname(filePath);

	const Resolved = NormaliseImportPath(
		filePath,

		ImportPath.startsWith(".") ? join(SourceDir, ImportPath) : ImportPath,
	);

	const AbsolutePath = resolve(Resolved);

	let Contents: string;

	try {
		Contents = await readFile(AbsolutePath, "utf8");
	} catch {
		return null;
	}

	return ResolveNamedMembers(
		interfaceName,

		AbsolutePath,

		Contents,

		visited,

		depth + 1,
	);
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
): Promise<ResolveOutcome | null> =>
	ResolveNamedMembers(
		options.InterfaceName,

		options.DecoratorFilePath,

		options.DecoratorFileContents,

		new Set<string>(),

		0,
	);

export default ResolveInterfaceCrossFile;
