/**
 * @module Wind/Shim/Gate
 * @description
 * Reads the TierShim compile-time constant and exports boolean flags for each
 * activation level. Used as the master switch for all shim functionality.
 *
 * The value is baked at BUILD TIME via esbuild's `define` substitution —
 * `__LandTier_Shim__` is replaced with a JSON string literal by
 * TierEnvironment.sh → CocoonEsbuildDefine → esbuild config. This means
 * esbuild can dead-code-eliminate the entire Shim module when TierShim=None.
 *
 * TierShim values (from .env.Land → TierEnvironment.sh → esbuild define):
 *   None     — All shim code compiled out (tree-shaken by esbuild) [default]
 *   Proxy    — Audit-only: observe service resolution, no redirect
 *   Replace  — Replace individual services with Land shims
 *   Own      — Land owns the InstantiationService container
 *   Preempt  — Land controls BrowserMain.open() entirely
 *
 * Propagation chain:
 *   .env.Land (TierShim=None)
 *     → TierEnvironment.sh (sources .env.Land, reads TierShim)
 *       → CocoonEsbuildDefine (JSON blob: {"__LandTier_Shim__":"\"Proxy\""})
 *         → Wind ESBuild.ts / Cocoon ESBuild.ts (define: JSON.parse(CocoonEsbuildDefine))
 *           → esbuild replaces `__LandTier_Shim__` with "\"Proxy\""
 *             → This module reads it as a string literal
 */

import type { ShimLevel } from "./Type.js";

/**
 * esbuild `define` replaces this `declare const` with the baked value
 * from .env.Land. Every Tier* var follows this same pattern — see
 * `Cocoon/Source/Bootstrap/Implementation/Cocoon/Main.ts` for the
 * full declare block.
 */
declare const __LandTier_Shim__: string;

/** Resolved at BUILD TIME — esbuild substitutes the string literal */
const Level: ShimLevel = (__LandTier_Shim__ || "None") as ShimLevel;

/** Master gate: true when ANY shim functionality is active */
const IsEnabled: boolean = Level !== "None";

/** Audit-only mode: observe, don't change anything */
const IsProxy: boolean = Level === "Proxy";

/** Service replacement active */
const IsReplace: boolean =
	Level === "Replace" || Level === "Own" || Level === "Preempt";

/** Full container ownership active */
const IsOwn: boolean = Level === "Own" || Level === "Preempt";

/** Nuclear option: Land controls BrowserMain.open() */
const IsPreempt: boolean = Level === "Preempt";

/** The current shim level */
const CurrentLevel: ShimLevel = Level;

export {
	// types
	type ShimLevel,
	// values
	IsEnabled,
	IsProxy,
	IsReplace,
	IsOwn,
	IsPreempt,
	CurrentLevel,
};
