/**
 * @module Codegen/Extract/ExtractDecoratorMatch
 * @description
 * Lightweight regex-based extractor for `createDecorator(...)`
 * exports. Captures the decorator export name, the literal tag
 * string passed to `createDecorator`, the source line, and a
 * preceding JSDoc comment when present.
 *
 * The extractor intentionally does not use the full TypeScript
 * compiler API - it must run inside `Wind/prepublishOnly.sh` with
 * zero additional dependencies. The regex anchors are stable
 * across every modern VS Code release because the
 * `export const I<X>: createDecorator<I<X>> = createDecorator('<x>');`
 * shape is enforced by VS Code's own lint rules.
 * @category Extract
 */

export interface DecoratorMatch {
	readonly DecoratorName: string;
	readonly InterfaceName: string;
	readonly DecoratorTag: string;
	readonly SourceLine: number;
	readonly DocComment: string | null;
}

const DecoratorPattern =
	/export\s+const\s+(I[A-Za-z0-9_]+)\s*(?::\s*createDecorator<\s*([A-Za-z0-9_]+)\s*>)?\s*=\s*createDecorator(?:<\s*[A-Za-z0-9_]+\s*>)?\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*;/g;

const StripJSDocPrefix = (raw: string): string => {
	const Lines = raw.split(/\r?\n/);
	const Cleaned: string[] = [];
	for (const Line of Lines) {
		const Trimmed = Line.replace(/^\s*\/?\*+\/?/, "").replace(/\*+\/?$/, "");
		Cleaned.push(Trimmed.trim());
	}
	return Cleaned.filter((line) => line.length > 0).join("\n");
};

const PrecedingDocComment = (
	source: string,
	declarationStart: number,
): string | null => {
	const Slice = source.slice(0, declarationStart);
	const Match = /\/\*\*([\s\S]*?)\*\/\s*$/m.exec(Slice);
	if (!Match) return null;
	return StripJSDocPrefix(Match[1] ?? "") || null;
};

const LineFromOffset = (source: string, offset: number): number => {
	let Line = 1;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source.charCodeAt(i) === 10) Line += 1;
	}
	return Line;
};

export const ExtractDecoratorMatches = (
	source: string,
): ReadonlyArray<DecoratorMatch> => {
	const Matches: DecoratorMatch[] = [];
	DecoratorPattern.lastIndex = 0;
	let Match: RegExpExecArray | null;
	while ((Match = DecoratorPattern.exec(source)) !== null) {
		const DeclarationStart = Match.index;
		const DecoratorName = Match[1] ?? "";
		const InterfaceName = Match[2] ?? DecoratorName;
		const DecoratorTag = Match[3] ?? "";
		Matches.push({
			DecoratorName,
			InterfaceName,
			DecoratorTag,
			SourceLine: LineFromOffset(source, DeclarationStart),
			DocComment: PrecedingDocComment(source, DeclarationStart),
		});
	}
	return Matches;
};

export default ExtractDecoratorMatches;
