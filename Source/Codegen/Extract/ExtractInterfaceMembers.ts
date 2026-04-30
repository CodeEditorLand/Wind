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

import type {
	InterfaceMemberKind,
	InterfaceMemberParameter,
	InterfaceMemberRecord,
} from "../Type/InterfaceMemberRecord.js";

const FindInterfaceBlock = (
	source: string,
	interfaceName: string,
): { readonly Inner: string; readonly StartOffset: number } | null => {
	const Pattern = new RegExp(
		`(?:export\\s+)?interface\\s+${interfaceName}(?:<[^>]+>)?(?:\\s+extends\\s+[^\\{]+)?\\s*\\{`,
	);
	const HeaderMatch = Pattern.exec(source);
	if (!HeaderMatch) return null;
	const OpenIndex = HeaderMatch.index + HeaderMatch[0].length - 1;
	let Depth = 0;
	let Cursor = OpenIndex;
	while (Cursor < source.length) {
		const Char = source[Cursor];
		if (Char === "{") Depth += 1;
		else if (Char === "}") {
			Depth -= 1;
			if (Depth === 0) {
				return {
					Inner: source.slice(OpenIndex + 1, Cursor),
					StartOffset: HeaderMatch.index,
				};
			}
		}
		Cursor += 1;
	}
	return null;
};

const StripJSDoc = (raw: string): string => {
	const Lines = raw.split(/\r?\n/);
	const Cleaned: string[] = [];
	for (const Line of Lines) {
		const Trimmed = Line.replace(/^\s*\/?\*+\/?/, "").replace(/\*+\/?$/, "");
		Cleaned.push(Trimmed.trim());
	}
	return Cleaned.filter((line) => line.length > 0).join("\n");
};

// `<` / `>` are overloaded in TypeScript: they open / close generics
// (`Foo<R>`) AND form arrow operators (`=>`) and comparison operators
// (`<=`, `>=`). When SplitMembers tracks depth naively, a parameter
// like `task: (...) => Promise<R>,\n` flips the depth back to 0
// mid-method (the `>` of `=>` decrements), and the splitter
// incorrectly treats the rest of the method's parameter list as a
// new member. Skip `<` / `>` when they're part of an operator.
const ShouldSkipAngle = (
	source: string,
	index: number,
	char: string,
	previousChar: string,
): boolean => {
	if (char === ">") {
		// `=>` arrow OR `>=` comparison.
		if (previousChar === "=") return true;
		if (source[index + 1] === "=") return true;
	}
	if (char === "<") {
		// `<=` comparison OR `<<` shift (rare in interface bodies but
		// harmless to skip).
		if (source[index + 1] === "=") return true;
		if (source[index + 1] === "<") return true;
	}
	return false;
};

const SplitMembers = (inner: string): ReadonlyArray<string> => {
	const Out: string[] = [];
	let Depth = 0;
	let Buffer = "";
	let LastChar = "";
	for (let i = 0; i < inner.length; i++) {
		const Char = inner[i] ?? "";
		Buffer += Char;
		const SkipAngle = ShouldSkipAngle(inner, i, Char, LastChar);
		if (!SkipAngle) {
			if (Char === "<" || Char === "(" || Char === "{" || Char === "[") {
				Depth += 1;
			} else if (Char === ">" || Char === ")" || Char === "}" || Char === "]") {
				Depth = Math.max(0, Depth - 1);
			}
		}
		if (Depth === 0 && (Char === ";" || (Char === "\n" && LastChar === ","))) {
			const Trimmed = Buffer.trim();
			if (Trimmed.length > 0) Out.push(Trimmed);
			Buffer = "";
		}
		LastChar = Char;
	}
	const Trailing = Buffer.trim();
	if (Trailing.length > 0) Out.push(Trailing);
	return Out;
};

const ExtractMemberDocComment = (
	beforeMember: string,
): string | null => {
	const Match = /\/\*\*([\s\S]*?)\*\/\s*$/m.exec(beforeMember);
	if (!Match) return null;
	const Cleaned = StripJSDoc(Match[1] ?? "");
	return Cleaned.length > 0 ? Cleaned : null;
};

const SplitTopLevel = (
	value: string,
	delimiter: string,
): ReadonlyArray<string> => {
	const Out: string[] = [];
	let Depth = 0;
	let Buffer = "";
	let LastChar = "";
	for (let i = 0; i < value.length; i++) {
		const Char = value[i] ?? "";
		const SkipAngle = ShouldSkipAngle(value, i, Char, LastChar);
		if (!SkipAngle) {
			if (Char === "<" || Char === "(" || Char === "{" || Char === "[") {
				Depth += 1;
			} else if (Char === ">" || Char === ")" || Char === "}" || Char === "]") {
				Depth = Math.max(0, Depth - 1);
			}
		}
		if (Char === delimiter && Depth === 0) {
			Out.push(Buffer.trim());
			Buffer = "";
			LastChar = Char;
			continue;
		}
		Buffer += Char;
		LastChar = Char;
	}
	const Trailing = Buffer.trim();
	if (Trailing.length > 0) Out.push(Trailing);
	return Out;
};

const ParseParameters = (
	parameterText: string,
): ReadonlyArray<InterfaceMemberParameter> => {
	const Trimmed = parameterText.trim();
	if (Trimmed.length === 0) return [];
	const Parts = SplitTopLevel(Trimmed, ",");
	const Out: InterfaceMemberParameter[] = [];
	for (const Part of Parts) {
		const Match = /^([A-Za-z0-9_$]+)(\?)?\s*:\s*([\s\S]+)$/.exec(Part);
		if (!Match) continue;
		Out.push({
			Name: Match[1] ?? "",
			Optional: Match[2] === "?",
			TypeText: (Match[3] ?? "").trim(),
		});
	}
	return Out;
};

const KindFromShape = (
	memberText: string,
	name: string,
	typeText: string,
): InterfaceMemberKind => {
	if (/^get\s/.test(memberText) && memberText.includes(": ")) return "Getter";
	if (/^set\s/.test(memberText)) return "Setter";
	if (memberText.startsWith("[")) return "Index";
	if (
		typeText.startsWith("Event<") ||
		(typeText.includes("Event<") && name.startsWith("on"))
	) {
		return "Event";
	}
	if (memberText.includes("(") && memberText.indexOf("(") < memberText.indexOf(":")) {
		return "Method";
	}
	return "Property";
};

const LineFromOffset = (source: string, offset: number): number => {
	let Line = 1;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source.charCodeAt(i) === 10) Line += 1;
	}
	return Line;
};

const ParseMember = (
	memberText: string,
	memberOffset: number,
	source: string,
): InterfaceMemberRecord | null => {
	const ReadonlyMatch = /^readonly\s+/.exec(memberText);
	const StrippedReadonly = ReadonlyMatch
		? memberText.slice(ReadonlyMatch[0].length)
		: memberText;

	const MethodMatch = /^([A-Za-z0-9_$]+)(\?)?\s*\(([\s\S]*?)\)\s*:\s*([\s\S]+);?$/.exec(
		StrippedReadonly.trim(),
	);
	if (MethodMatch) {
		const Name = MethodMatch[1] ?? "";
		const ReturnType = (MethodMatch[4] ?? "").replace(/;\s*$/, "").trim();
		return {
			Kind: "Method",
			Name,
			Readonly: ReadonlyMatch !== null,
			Optional: MethodMatch[2] === "?",
			TypeText: ReturnType,
			Parameters: ParseParameters(MethodMatch[3] ?? ""),
			DocComment: ExtractMemberDocComment(source.slice(0, memberOffset)),
			SourceLine: LineFromOffset(source, memberOffset),
		};
	}

	const PropertyMatch = /^([A-Za-z0-9_$]+)(\?)?\s*:\s*([\s\S]+?);?\s*$/.exec(
		StrippedReadonly.trim(),
	);
	if (PropertyMatch) {
		const Name = PropertyMatch[1] ?? "";
		const TypeText = (PropertyMatch[3] ?? "").trim();
		return {
			Kind: KindFromShape(StrippedReadonly.trim(), Name, TypeText),
			Name,
			Readonly: ReadonlyMatch !== null,
			Optional: PropertyMatch[2] === "?",
			TypeText,
			Parameters: [],
			DocComment: ExtractMemberDocComment(source.slice(0, memberOffset)),
			SourceLine: LineFromOffset(source, memberOffset),
		};
	}

	return null;
};

export const ExtractInterfaceMembers = (
	source: string,
	interfaceName: string,
): ReadonlyArray<InterfaceMemberRecord> => {
	const Block = FindInterfaceBlock(source, interfaceName);
	if (!Block) return [];
	const Inner = Block.Inner;
	const Members = SplitMembers(Inner);
	const Out: InterfaceMemberRecord[] = [];
	let Cursor = Block.StartOffset + (source.indexOf("{", Block.StartOffset) - Block.StartOffset) + 1;
	for (const MemberText of Members) {
		const RelativeOffset = Inner.indexOf(MemberText.split(/\s+/)[0] ?? MemberText);
		const AbsoluteOffset = Cursor + Math.max(0, RelativeOffset);
		const Parsed = ParseMember(MemberText, AbsoluteOffset, source);
		if (Parsed) Out.push(Parsed);
	}
	return Out;
};

export default ExtractInterfaceMembers;
