/**
 * @module Effect/LandWorkbench/LandWorkbenchGlobal
 * @description
 * Typed declaration of the `globalThis.__CEL_WIND__` bridge. Sky's
 * bundled-electron entry calls `InstallLandWorkbench()` after
 * `__CEL_SERVICES__` is populated; the installer exposes the plain
 * service registry and dispatches `cel:wind-ready` for downstream
 * subscribers.
 *
 * Consumers (SkyBridge, Astro components, browser-tier Wind tasks)
 * `import { CELWind } from ".../LandWorkbenchGlobal.js"` and call
 * `CELWind().Services.<Name>.<Method>(...)` directly. No callsite
 * ever touches `globalThis.__CEL_WIND__` directly - the typed
 * wrapper is the single binding.
 * @category Composition
 */

import type { LandWorkbenchServices } from "./LandWorkbenchRuntime.js";

import { LandWorkbenchRuntime } from "./LandWorkbenchRuntime.js";

export interface CELWindGlobalShape {
	readonly Services: LandWorkbenchServices;

	readonly Dispose: () => Promise<void>;
}

export interface CELWindGlobals {
	__CEL_WIND__?: CELWindGlobalShape;
}

const InstallEvent = "cel:wind-ready";

export const InstallLandWorkbench = (): CELWindGlobalShape => {
	const Globals = globalThis as unknown as CELWindGlobals;

	if (Globals.__CEL_WIND__) return Globals.__CEL_WIND__;

	const Bridge: CELWindGlobalShape = {
		Services: LandWorkbenchRuntime.Get(),

		Dispose: () => LandWorkbenchRuntime.Dispose(),
	};

	Globals.__CEL_WIND__ = Bridge;

	try {
		window.dispatchEvent(new Event(InstallEvent));
	} catch {
		// no window in tests; nothing to dispatch
	}

	return Bridge;
};

export const CELWind = (): CELWindGlobalShape => {
	const Globals = globalThis as unknown as CELWindGlobals;

	if (!Globals.__CEL_WIND__) {
		throw new Error(
			"[Wind] __CEL_WIND__ not installed. Call InstallLandWorkbench() once after __CEL_SERVICES__ is populated.",
		);
	}

	return Globals.__CEL_WIND__;
};
