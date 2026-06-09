/**
 * @module Effect/LandWorkbench/LandWorkbenchRuntime
 * @description
 * Eager `ManagedRuntime` that wraps `LandWorkbenchLayer`.
 * Created immediately at module load time via IIFE so Layer initialization
 * cost is paid once during Sky bundle evaluation, not on first Get() call.
 *
 * The runtime is module-singleton via `globalThis.__CEL_WIND_RUNTIME__`
 * so two sibling Sky chunks importing this module land on the same instance.
 * @category Composition
 */

import { ManagedRuntime } from "effect";

import { LandWorkbenchLayer } from "./LandWorkbenchLayer.js";

interface LandWorkbenchRuntimeGlobal {
	__CEL_WIND_RUNTIME__?: ReturnType<
		typeof ManagedRuntime.make<typeof LandWorkbenchLayer, never>
	>;
}

// Eagerly initialize at module load time — eliminates first-call latency.
const _rt = (() => {
	const Globals = globalThis as unknown as LandWorkbenchRuntimeGlobal;

	if (!Globals.__CEL_WIND_RUNTIME__) {
		Globals.__CEL_WIND_RUNTIME__ = ManagedRuntime.make(LandWorkbenchLayer);
	}

	return Globals.__CEL_WIND_RUNTIME__;
})();

export const LandWorkbenchRuntime = {
	Get: () => _rt,

	Dispose: async (): Promise<void> => {
		await _rt.dispose();

		delete (globalThis as unknown as LandWorkbenchRuntimeGlobal)
			.__CEL_WIND_RUNTIME__;
	},
};

export default LandWorkbenchRuntime;
