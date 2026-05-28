/**
 * @module Codegen/Type/ServiceDecoratorRecord
 * @description
 * Strongly-typed record of a single VS Code service decorator
 * extracted from `src/vs/**.ts`. One record per `createDecorator(...)`
 * call site. Captures every datum the schema emitter needs to write
 * a Wind-side bridge shape grounded in real upstream source.
 * @category Type
 */

import type { InterfaceMemberRecord } from "./InterfaceMemberRecord.js";

export interface ServiceDecoratorRecord {
	/** Decorator export name, e.g. `IConfigurationService`. */
	readonly DecoratorName: string;

	/** String literal passed to `createDecorator(...)`. */
	readonly DecoratorTag: string;

	/** TypeScript interface name the decorator binds to (defaults to
	 * `DecoratorName` when the file follows the
	 * `export const I<X>: createDecorator<I<X>>('...')` pattern).
	 */
	readonly InterfaceName: string;

	/** Workspace-relative path of the source file. */
	readonly SourcePath: string;

	/** 1-based line number of the decorator declaration. */
	readonly SourceLine: number;

	/** Members extracted from the matching interface declaration.
	 * Empty when the interface declaration was not in the same file
	 * (codegen does cross-file resolution as a follow-up pass).
	 */
	readonly Members: ReadonlyArray<InterfaceMemberRecord>;

	/** JSDoc above the decorator export, trimmed. */
	readonly DecoratorDocComment: string | null;

	/** JSDoc above the interface declaration, trimmed. */
	readonly InterfaceDocComment: string | null;
}
