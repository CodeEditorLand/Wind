import type { Effect } from "effect";

import type { KeybindingProblem } from "../Type/KeybindingProblem.js";

/**
 * Keybinding service interface.
 * Manages keyboard shortcut registration and resolution.
 * Allows extensions and Wind components to add/remove dynamic keybindings
 * and look up the resolved keybinding for any command.
 *
 * Microsoft VSCode Reference: IKeybindingService from
 * vs/platform/keybinding/common/keybinding.ts
 */
export interface KeybindingService {
	/**
	 * Register a dynamic keybinding.
	 * @param commandId  Command to invoke (e.g. "workbench.action.files.save")
	 * @param keybinding Key expression (e.g. "ctrl+s", "cmd+shift+p")
	 * @param when       Optional when-clause (e.g. "editorFocus")
	 */
	readonly AddKeybinding: (
		commandId: string,

		keybinding: string,

		when?: string,
	) => Effect.Effect<void, KeybindingProblem>;

	/** Remove all dynamic keybindings registered for a command. */
	readonly RemoveKeybinding: (
		commandId: string,
	) => Effect.Effect<void, KeybindingProblem>;

	/**
	 * Look up the resolved keybinding string for a command.
	 * Returns null when no keybinding is registered.
	 */
	readonly LookupKeybinding: (
		commandId: string,
	) => Effect.Effect<string | null, KeybindingProblem>;

	/** Return all currently registered dynamic keybinding entries. */
	readonly GetKeybindings: () => Effect.Effect<
		ReadonlyArray<{ commandId: string; keybinding: string; when?: string }>,
		KeybindingProblem
	>;
}
