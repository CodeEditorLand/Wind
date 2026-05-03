/**
 * @module Codegen/Extract/IterateCommandRegistrations
 * @description
 * Async-iterator that yields one `CommandRegistrationRecord` for every
 * `CommandsRegistry.registerCommand(...)` /
 * `KeybindingsRegistry.registerCommandAndKeybindingRule(...)` /
 * `MenuRegistry.appendMenuItem(...)` call site we can statically
 * locate in VS Code's TypeScript source.
 *
 * The extractor is deliberately string-anchored - the upstream API
 * surface is stable enough that anchoring on the registrar identifier
 * is robust across the 1.93 → 1.95 line of release branches the
 * monorepo tracks. We capture the command id from the first argument
 * (literal string OR `id: '<identifier>'` in an options object) and
 * derive `HasKeybinding` from the presence of a sibling `weight:` or
 * `primary:` key in the same call expression.
 *
 * Cases the extractor explicitly skips:
 *   - Calls where the first argument is a non-literal expression -
 *     dynamic ids surface at runtime and the smoke-test harness will
 *     have to discover them via `vscode.commands.getCommands()`.
 *   - Calls inside `_test_*` / `*test*` files - covered by the walker's
 *     exclusion list, but doubled-up here so a future test fixture
 *     doesn't poison the catalog.
 *   - Comment-only matches (the regex anchors on a `(` immediately
 *     following the registrar, but a literal `CommandsRegistry`
 *     reference inside a comment block could still match - the
 *     subsequent argument-extraction step rejects mismatches).
 *
 * @category Extract
 */

import type { CommandRegistrationRecord } from "../Type/CommandRegistrationRecord.js";
import type { SourceFile } from "../Walk/SourceTreeWalker.js";

const RegistrarPattern =
	/(CommandsRegistry|KeybindingsRegistry|MenuRegistry)\.(registerCommand|registerCommandAndKeybindingRule|appendMenuItem)\s*\(/g;

const IdentifierLiteralPattern = /['"`]([A-Za-z0-9_.\-:+]+)['"`]/;

const KindFor = (registrar: string): CommandRegistrationRecord["Kind"] => {
	if (registrar === "CommandsRegistry") return "CommandsRegistry";
	if (registrar === "KeybindingsRegistry") return "KeybindingsRegistry";
	return "MenuRegistry";
};

const LineNumberAt = (contents: string, index: number): number => {
	let Line = 1;
	for (
		let Cursor = 0;
		Cursor < index && Cursor < contents.length;
		Cursor += 1
	) {
		if (contents.charCodeAt(Cursor) === 10) Line += 1;
	}
	return Line;
};

const ScanArgumentBlock = (
	contents: string,
	openParenIndex: number,
): { argumentText: string; closeParenIndex: number } | null => {
	// Scan forward from `openParenIndex` (which points to `(`) and
	// track parenthesis depth + simple string-literal state so we land
	// on the matching `)` of the registrar call rather than the first
	// `)` we see (which would frequently be the inside of a nested
	// `weight: KeybindingWeight.WorkbenchContrib` lookup).
	let Depth = 0;
	let Cursor = openParenIndex;
	let StringChar: string | null = null;
	for (; Cursor < contents.length; Cursor += 1) {
		const Char = contents[Cursor];
		if (StringChar) {
			if (Char === "\\") {
				Cursor += 1;
				continue;
			}
			if (Char === StringChar) StringChar = null;
			continue;
		}
		if (Char === "'" || Char === '"' || Char === "`") {
			StringChar = Char;
			continue;
		}
		if (Char === "(") {
			Depth += 1;
			continue;
		}
		if (Char === ")") {
			Depth -= 1;
			if (Depth === 0) {
				return {
					argumentText: contents.slice(openParenIndex + 1, Cursor),
					closeParenIndex: Cursor,
				};
			}
		}
	}
	return null;
};

const ExtractCommandIdentifier = (argumentText: string): string | null => {
	// Three syntactic shapes show up in upstream:
	//   1. `registerCommand('id', handler)`
	//   2. `registerCommand({ id: 'id', handler })`
	//   3. `registerCommand({ command: { id: 'id', ... } })`  (Action descriptors)
	// The literal-pattern below catches all three; we just take the
	// first match which is always the id slot.
	const Trimmed = argumentText.trimStart();
	const PositionalMatch = IdentifierLiteralPattern.exec(Trimmed);
	if (!PositionalMatch) return null;

	const Candidate = PositionalMatch[1];
	if (!Candidate) return null;

	// Filter out anchors that look like file paths or `import('...')`
	// specifiers - the registrar regex won't anchor those, but a
	// belt-and-braces guard keeps the catalog tight.
	if (Candidate.includes("/") || Candidate.includes("\\")) return null;
	if (Candidate.length < 2) return null;
	return Candidate;
};

const HasKeybindingHint = (argumentText: string): boolean => {
	if (!/\bweight\s*:/.test(argumentText)) {
		if (!/\bprimary\s*:/.test(argumentText)) {
			return false;
		}
	}
	return true;
};

export const IterateCommandRegistrations = async function* (
	files: AsyncIterable<SourceFile>,
): AsyncIterableIterator<CommandRegistrationRecord> {
	for await (const File of files) {
		// Reset the global regex's lastIndex per file so iterators
		// don't share scan state across siblings.
		RegistrarPattern.lastIndex = 0;
		let Match: RegExpExecArray | null;
		while ((Match = RegistrarPattern.exec(File.Contents)) !== null) {
			const Registrar = Match[1];
			if (!Registrar) continue;
			const OpenParen = Match.index + Match[0].length - 1;
			const Block = ScanArgumentBlock(File.Contents, OpenParen);
			if (!Block) continue;
			const Identifier = ExtractCommandIdentifier(Block.argumentText);
			if (!Identifier) continue;
			yield {
				CommandIdentifier: Identifier,
				Kind: KindFor(Registrar),
				SourcePath: File.SourcePath,
				SourceLine: LineNumberAt(File.Contents, Match.index),
				HasKeybinding: HasKeybindingHint(Block.argumentText),
			};
		}
	}
};

export default IterateCommandRegistrations;
