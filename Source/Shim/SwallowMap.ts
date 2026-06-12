/**
 * @module Wind/Shim/SwallowMap
 * @description
 * Pattern-matching decision engine for the Land Shim. Given a method name
 * (e.g., "statusbar:set", "scm:createSourceControl"), decides whether to:
 *
 *   SWALLOW     — Land handles it, VS Code never sees it
 *   PASSTHROUGH — VS Code handles it normally, Land doesn't interfere
 *   MIXED       — Both handle it, Land gatekeeps the response
 *   DISCARD     — Silently dropped (e.g., Microsoft telemetry)
 *
 * Rules are loaded from a built-in default set. They can be extended at
 * runtime via `load()` for per-environment customization.
 *
 * Match order: rules are checked in insertion order. First match wins.
 * Default (no match): PASSTHROUGH to None.
 */

import type { SwallowRule, SwallowDecision, SwallowAction } from "./Type.js";

class SwallowMap {
	private static rules: SwallowRule[] = [];

	/**
	 * Load/replace the entire ruleset.
	 * @param rules - Ordered array of swallow rules (first match wins)
	 */
	static load(rules: SwallowRule[]): void {
		this.rules = [...rules];
	}

	/**
	 * Decide what to do with a given method.
	 * @param method - IPC method name (e.g., "statusbar:set")
	 */
	static decide(method: string): SwallowDecision {
		for (let i = 0; i < this.rules.length; i++) {
			const rule = this.rules[i];

			// Match: prefix check or regex
			let matches = false;
			try {
				if (rule.pattern.startsWith("^") || rule.pattern.includes(".*")) {
					matches = new RegExp(rule.pattern).test(method);
				} else {
					matches = method.startsWith(rule.pattern);
				}
			} catch {
				// Invalid regex — skip this rule
				continue;
			}

			if (matches) {
				// Check optional runtime condition
				if (rule.condition && !rule.condition(method, [])) {
					continue; // condition failed — try next rule
				}

				return {
					action: rule.action,
					redirectTo: rule.redirectTo,
				};
			}
		}

		// Default: pass through — let VS Code handle it
		return { action: "PASSTHROUGH", redirectTo: "None" };
	}

	/**
	 * Quick check: should this method be swallowed (or discarded)?
	 */
	static shouldSwallow(method: string): boolean {
		const decision = this.decide(method);
		return decision.action === "SWALLOW" || decision.action === "DISCARD";
	}

	/**
	 * Quick check: should this method pass through to VS Code?
	 */
	static shouldPassthrough(method: string): boolean {
		return this.decide(method).action === "PASSTHROUGH";
	}

	/**
	 * Get the redirect target for a method, or "None" if not swallowed.
	 */
	static redirectTarget(method: string): string {
		const decision = this.decide(method);
		if (decision.action === "SWALLOW" || decision.action === "MIXED") {
			return decision.redirectTo;
		}
		return "None";
	}

	/**
	 * Check if a specific action is the decision for a method.
	 */
	static is(method: string, action: SwallowAction): boolean {
		return this.decide(method).action === action;
	}

	/**
	 * Load the built-in default rules.
	 *
	 * Rules are ordered from most-specific to least-specific.
	 * The final catch-all PASSTHROUGH is implicit (default return).
	 */
	static loadDefaults(): void {
		this.load([
			// ── Status Bar ──
			{
				pattern: "statusbar:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},
			{
				pattern: "$setStatusBarMessage",
				action: "SWALLOW",
				redirectTo: "Wind",
			},
			{
				pattern: "$disposeStatusBarMessage",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── SCM / Source Control ──
			{
				pattern: "scm:",
				action: "SWALLOW",
				redirectTo: "Cocoon",
			},
			{
				pattern: "$scm:",
				action: "SWALLOW",
				redirectTo: "Cocoon",
			},

			// ── Search ──
			{
				pattern: "search:",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "workspace:find",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},

			// ── Terminal ──
			{
				pattern: "terminal:",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},

			// ── Output ──
			{
				pattern: "output:",
				action: "SWALLOW",
				redirectTo: "Output",
			},
			{
				pattern: "sky:output",
				action: "SWALLOW",
				redirectTo: "Output",
			},

			// ── File System ──
			{
				pattern: "file:read",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "file:write",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "file:stat",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "file:delete",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "file:mkdir",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "file:readdir",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},

			// ── Notifications ──
			{
				pattern: "notification:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Dialogs ──
			{
				pattern: "dialog:",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "showOpenDialog",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
			{
				pattern: "showSaveDialog",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},

			// ── Quick Input / Quick Pick ──
			{
				pattern: "quickInput:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},
			{
				pattern: "quickpick:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Keybindings ──
			{
				pattern: "keybinding:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Themes ──
			{
				pattern: "theme:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},
			{
				pattern: "workbenchTheme:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Configuration ──
			{
				pattern: "configuration:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Telemetry (Microsoft) ──
			{
				pattern: "telemetry:",
				action: "DISCARD",
				redirectTo: "None",
			},

			// ── Extension Gallery ──
			{
				pattern: "extensionsGallery:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},
			{
				pattern: "extensionGallery:",
				action: "SWALLOW",
				redirectTo: "Wind",
			},

			// ── Product Identity ──
			{
				pattern: "product:",
				action: "SWALLOW",
				redirectTo: "Mountain",
			},
		]);
	}

	/**
	 * Dump all current rules (for debugging).
	 */
	static dumpRules(): SwallowRule[] {
		return [...this.rules];
	}
}

export { SwallowMap };
