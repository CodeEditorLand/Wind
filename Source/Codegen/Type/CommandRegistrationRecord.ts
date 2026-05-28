/**
 * @module Codegen/Type/CommandRegistrationRecord
 * @description
 * Strongly-typed record of a single VS Code command registration
 * extracted from `src/vs/**.ts`. One record per
 * `CommandsRegistry.registerCommand(...)` /
 * `KeybindingsRegistry.registerCommandAndKeybindingRule(...)` call
 * site. The catalog feeds both the smoke-test harness (Wind/Sky boots
 * up, walks the catalog, asserts each id is callable) and the
 * dual-track router (Mountain Rust handlers vs. lifted JS commands)
 * so command coverage stays grounded in upstream source rather than
 * a hand-curated allowlist.
 *
 * Capturing the *signature* (whether the registration carries a
 * keybinding, whether the handler is async, the arity hint pulled
 * from the registered function's declaration) is deliberately
 * out-of-scope - those would inflate the catalog without telling
 * the smoke-test harness anything it can act on. If a command later
 * needs richer metadata, the codegen pass adds another field; the
 * record evolves additively.
 *
 * @category Type
 */

export type CommandRegistrationKind =
	| "CommandsRegistry"
	| "KeybindingsRegistry"
	| "MenuRegistry"
	| "ActionDescriptor";

export interface CommandRegistrationRecord {
	/** The command id (string literal passed to the registrar). */
	readonly CommandIdentifier: string;

	/** Which registrar surfaced the registration. Useful when
	 * disambiguating coverage tiers (smoke-test harness asserts
	 * every `CommandsRegistry` entry; only smoke-asserts
	 * `KeybindingsRegistry` entries that survive bundle minification).
	 */
	readonly Kind: CommandRegistrationKind;

	/** Workspace-relative path of the source file. */
	readonly SourcePath: string;

	/** 1-based line number of the registration call site. */
	readonly SourceLine: number;

	/** Whether the registration call carries a `weight:` /
	 * `primary:` field, which indicates a keybinding was registered
	 * alongside the command. The smoke-test harness uses this to
	 * assert keybinding service routing for the subset that has one.
	 */
	readonly HasKeybinding: boolean;
}
