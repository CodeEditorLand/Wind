/**
 * @module Wind/Shim/Gate
 * @description
 * Reads the TierShim env var and exports boolean flags for each activation
 * level. Used as the master switch for all shim functionality.
 *
 * TierShim values (from .env.Land):
 *   None     — All shim code compiled out (tree-shaken by esbuild)
 *   Proxy    — Audit-only: observe service resolution, no redirect
 *   Replace  — Replace individual services with Land shims
 *   Own      — Land owns the InstantiationService container
 *   Preempt  — Land controls BrowserMain.open() entirely
 */

import type { ShimLevel } from "./Type.js";

/** Resolved once at module load — compile-time constant */
const Level: ShimLevel = (process.env["TierShim"] || "None") as ShimLevel;

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
