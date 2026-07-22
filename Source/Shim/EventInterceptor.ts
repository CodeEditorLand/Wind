// @ts-nocheck
/**
 * @module Wind/Shim/EventInterceptor
 * @description
 * Intercepts DOM event listeners in Wind's renderer process by patching
 * `EventTarget.prototype.addEventListener`. Gated behind TierShim env var.
 *
 * When TierShim is "Own" or "Preempt", listeners for events that match
 * a SwallowMap rule are redirected to Land's RedirectBus instead of
 * being attached to the DOM element. This allows Land to control event
 * dispatch for specific event types (e.g., preventing VS Code from
 * capturing certain keybindings or mouse events).
 *
 * Activation levels:
 *   None     — No interception (passthrough — entire module tree-shaken)
 *   Proxy    — No interception (audit-only layer)
 *   Replace  — No interception (works at service level, not DOM events)
 *   Own      — Swallow-matched events are redirected to RedirectBus
 *   Preempt  — Same as Own
 *
 * Must be installed BEFORE any Wind UI components register event
 * listeners. Install at the top of Wind's bootstrap entry.
 */

import { RedirectBus } from "./RedirectBus.js";

import { SwallowMap } from "./SwallowMap.js";

import type { ShimLevel } from "./Type.js";

/**
 * Resolve the current TierShim level at runtime.
 * In production builds, esbuild substitutes `__LandTier_Shim__`
 * via the define map. In dev, falls back to process.env.
 */
declare const __LandTier_Shim__: string;

const TierShim: ShimLevel = ((typeof __LandTier_Shim__ === "string" &&
__LandTier_Shim__.length > 0
	? __LandTier_Shim__
	: process.env["TierShim"]) || "None") as ShimLevel;

/**
 * Install the DOM EventTarget.addEventListener interceptor.
 *
 * When TierShim is "Own" or "Preempt", patches
 * `EventTarget.prototype.addEventListener` so that events matching
 * SwallowMap rules are redirected to the RedirectBus instead of
 * being attached to the DOM element.
 *
 * The original `addEventListener` is preserved so that unpatched
 * event types still attach normally. Land-registered handlers
 * receive events through the RedirectBus rather than the DOM.
 *
 * IMPORTANT: Install before any UI component registers listeners.
 * Call this at the very top of Wind's bootstrap entry point.
 */
export default function installEventInterceptor(): void {

	// Only activate for Own and Preempt levels
	if (TierShim !== "Own" && TierShim !== "Preempt") {
		return;
	}

	const originalAddEventListener = EventTarget.prototype.addEventListener;

	EventTarget.prototype.addEventListener = function landAddEventListener(
		type: string,

		listener: EventListenerOrEventListenerObject | null,

		options?: boolean | AddEventListenerOptions,
	): void {
		// Check if this event type should be swallowed by Land
		if (SwallowMap.shouldSwallow(type)) {
			// Register the listener on the RedirectBus with the event
			// type as the pattern. When the event fires through the bus,
			// the listener receives the event as the first parameter.
			if (listener !== null) {
				RedirectBus.register({
					pattern: type,
					handle: async (
						_method: string,

						params: unknown[],
					): Promise<unknown> => {
						// Invoke the listener with the event object
						// (first element of params, if available)
						const event = params?.[0];

						if (typeof listener === "function") {
							listener(event as Event);
						} else if (
							listener !== null &&
							typeof (listener as EventListenerObject)
								.handleEvent === "function"
						) {
							(listener as EventListenerObject).handleEvent(
								event as Event,
							);
						}

						return undefined;
					},
				});
			}

			// Do NOT attach to DOM — Land owns this event type
			return;
		}

		// Passthrough: attach to DOM normally
		return originalAddEventListener.call(
			this,

			type,

			listener,

			options,
		);
	};
}
