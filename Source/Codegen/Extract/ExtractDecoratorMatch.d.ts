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

export declare const ExtractDecoratorMatches: (
	source: string,
) => ReadonlyArray<DecoratorMatch>;

export default ExtractDecoratorMatches;

//# sourceMappingURL=ExtractDecoratorMatch.d.ts.map
