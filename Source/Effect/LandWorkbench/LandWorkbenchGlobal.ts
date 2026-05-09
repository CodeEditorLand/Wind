/**
 * @module Effect/LandWorkbench/LandWorkbenchGlobal
 * @description
 * Typed declaration of the `globalThis.__CEL_WIND__` bridge. Sky's
 * bundled-electron entry calls `InstallLandWorkbench()` after
 * `__CEL_SERVICES__` is populated; the installer constructs the
 * runtime, exposes a typed accessor for every Wind layer, and
 * dispatches `cel:wind-ready` for downstream subscribers.
 *
 * Consumers (SkyBridge, Astro components, browser-tier Wind tasks)
 * `import { CELWind } from ".../LandWorkbenchGlobal.js"` and call
 * `CELWind.RunPromise(...)` to drive Effects scoped under the
 * `LandWorkbenchLayer`. No callsite ever touches
 * `globalThis.__CEL_WIND__` directly - the typed wrapper is the
 * single binding.
 * @category Composition
 */

import { Effect, type Cause, type Layer } from "effect";

import { LandWorkbenchLayer } from "./LandWorkbenchLayer.js";
import { LandWorkbenchRuntime } from "./LandWorkbenchRuntime.js";

export interface CELWindGlobalShape {
	readonly Layer: typeof LandWorkbenchLayer;

	readonly RunPromise: <A, E>(
		effect: Effect.Effect<
			A,
			E,
			Layer.Layer.Success<typeof LandWorkbenchLayer>
		>,
	) => Promise<A>;

	readonly RunPromiseExit: <A, E>(
		effect: Effect.Effect<
			A,
			E,
			Layer.Layer.Success<typeof LandWorkbenchLayer>
		>,
	) => Promise<{
		readonly _tag: "Success" | "Failure";

		readonly value?: A;

		readonly cause?: Cause.Cause<E>;
	}>;

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
		Layer: LandWorkbenchLayer,

		RunPromise: (effect) =>
			LandWorkbenchRuntime.Get().runPromise(effect) as Promise<never>,

		RunPromiseExit: async (effect) => {
			const Exit =
				await LandWorkbenchRuntime.Get().runPromiseExit(effect);

			if (Exit._tag === "Success") {
				return { _tag: "Success", value: Exit.value as never };
			}

			return { _tag: "Failure", cause: Exit.cause as never };
		},

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
