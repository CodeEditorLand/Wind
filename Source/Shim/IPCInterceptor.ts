/**
 * @module Wind/Shim/IPCInterceptor
 * @description
 * Intercepts every Tauri IPC `invoke("MountainIPCInvoke", {method, params})`
 * call before it reaches Mountain's DispatchMatch. Gated behind TierShim.
 *
 * When TierShim is active and a method matches a SwallowMap rule:
 *   - SWALLOW: the event is routed to Land's RedirectBus, VS Code never
 *     sees it. The original invoke() is never called.
 *   - MIXED: Land handles the event AND forwards it to VS Code, but
 *     Land's result is returned (VS Code's result is fire-and-forget).
 *   - PASSTHROUGH: the original invoke() is called normally.
 *   - DISCARD: the event is silently dropped, null is returned.
 *
 * When TierShim is None: this interceptor is a no-op passthrough
 * (esbuild tree-shakes the entire module when TierShim=None).
 */

import { IsEnabled } from "./Gate.js";
import { RedirectBus } from "./RedirectBus.js";
import { SwallowMap } from "./SwallowMap.js";
import type { SwallowDecision } from "./Type.js";

/**
 * Intercept an IPC invoke call.
 *
 * @param method - IPC method name (e.g., "statusbar:set")
 * @param params - Parameters array
 * @param originalInvoke - The original invoke function (for passthrough)
 * @returns The result, from either Land's handler or the original IPC
 */
const Intercept = async (
	method: string,

	params: unknown[],

	originalInvoke: (method: string, params: unknown[]) => Promise<unknown>,
): Promise<unknown> => {
	// Fast path: shim disabled — passthrough
	if (!IsEnabled) {
		return originalInvoke(method, params);
	}

	const decision: SwallowDecision = SwallowMap.decide(method);

	switch (decision.action) {
		case "SWALLOW":
			// Land handles it. VS Code NEVER sees this event.
			return RedirectBus.route(method, params);

		case "MIXED":
			// Land handles it AND VS Code handles it.
			// Land's result wins; VS Code result is fire-and-forget.
			const landResult = await RedirectBus.route(method, params);

			originalInvoke(method, params).catch(() => {
				/* fire-and-forget — Land's result already returned */
			});

			return landResult;

		case "DISCARD":
			// Silently dropped. Caller gets null.
			return null;

		case "PASSTHROUGH":
		default:
			// VS Code handles it normally. Land doesn't interfere.
			return originalInvoke(method, params);
	}
};

/**
 * Create a wrapped version of Tauri's `invoke` function.
 *
 * Usage in TauriMainProcessService:
 *   const invoke = createInterceptedInvoke(originalInvoke);
 *   // Then use `invoke` instead of `originalInvoke` everywhere
 *
 * @param originalInvoke - The real Tauri invoke function (e.g., from @tauri-apps/api/core)
 * @returns A wrapped invoke function that routes through the shim
 */
const createInterceptedInvoke = (
	originalInvoke: (
		cmd: string,

		args: Record<string, unknown>,
	) => Promise<unknown>,
) => {
	return async (
		command: string,

		args: Record<string, unknown> = {},
	): Promise<unknown> => {
		// Only intercept MountainIPCInvoke calls
		if (command !== "MountainIPCInvoke") {
			return originalInvoke(command, args);
		}

		const method = args["method"] as string;

		const params = (args["params"] || []) as unknown[];

		if (!method) {
			return originalInvoke(command, args);
		}

		return Intercept(method, params, async (m, p) => {
			return originalInvoke(command, {
				...args,
				method: m,
				params: p,
			});
		});
	};
};

export { Intercept, createInterceptedInvoke };
