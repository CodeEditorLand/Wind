/**
 * @module Effect/LandWorkbench/LandWorkbenchRuntime
 * @description
 * Lazy `ManagedRuntime` factory that wraps `LandWorkbenchLayer`.
 * Sky's bundle creates exactly one `LandWorkbenchRuntime` per
 * webview after `__CEL_SERVICES__` is populated; every consumer
 * (SkyBridge, in-process Wind components) reuses the same runtime
 * to keep `Layer` instantiation costs to one-time.
 *
 * The runtime is module-singleton via `globalThis.__CEL_WIND_RUNTIME__`
 * so two sibling Sky chunks importing this module land on the same
 * runtime instance - the alternative (per-chunk runtime) would
 * double-allocate every Wind service.
 * @category Composition
 */

import { ManagedRuntime } from "effect";

import { LandWorkbenchLayer } from "./LandWorkbenchLayer.js";

interface LandWorkbenchRuntimeGlobal {
	__CEL_WIND_RUNTIME__?: ReturnType<
		typeof ManagedRuntime.make<typeof LandWorkbenchLayer, never>
	>;
}

const ResolveRuntime = (): ReturnType<
	typeof ManagedRuntime.make<typeof LandWorkbenchLayer, never>
> => {
	const Globals = globalThis as unknown as LandWorkbenchRuntimeGlobal;

	if (!Globals.__CEL_WIND_RUNTIME__) {
		Globals.__CEL_WIND_RUNTIME__ = ManagedRuntime.make(LandWorkbenchLayer);
	}

	return Globals.__CEL_WIND_RUNTIME__;
};

export const LandWorkbenchRuntime = {
	Get: ResolveRuntime,

	Dispose: async (): Promise<void> => {
		const Globals = globalThis as unknown as LandWorkbenchRuntimeGlobal;

		const Existing = Globals.__CEL_WIND_RUNTIME__;

		if (Existing) {
			await Existing.dispose();

			Globals.__CEL_WIND_RUNTIME__ = undefined;
		}
	},
};

export default LandWorkbenchRuntime;
