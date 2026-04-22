/**
 * @module Telemetry/PostHogBridge
 * @description
 * Wind PostHog bridge. Reuses `window.posthog` in-webview (one client
 * per webview keeps the rate-limiter honest); falls back to `fetch`
 * against `/batch/` on the rare node-side path. Tagged `$tier:"wind"`.
 *
 * Implementation split across `PostHog/*.ts`; this file composes them
 * into the three external call sites: `CaptureEvent`, `CaptureError`,
 * `Initialize`.
 */

import GetBrowser from "./PostHog/Browser.js";
import ReadConfiguration from "./PostHog/Configuration.js";
import Fallback from "./PostHog/Fallback.js";
import ResolveDistinctIdentifier from "./PostHog/Identifier.js";
import BaseProperties from "./PostHog/Properties.js";
import type { Properties } from "./PostHog/Properties.js";

const Configuration = ReadConfiguration();

const DistinctIdentifier = ResolveDistinctIdentifier(
	Configuration.DistinctIdentifierSeed,
);

const Enrich = (Properties: Properties): Properties => ({
	...Properties,
	...BaseProperties,
});

export const CaptureEvent = (
	Event: string,
	Properties: Properties = {},
): void => {
	if (!Configuration.Enabled) return;

	const Enriched = Enrich(Properties);

	const Browser = GetBrowser();

	if (Browser?.capture) {
		try {
			Browser.capture(Event, Enriched);

			return;
		} catch {
			// Fall through to HTTP fallback.
		}
	}

	void Fallback(Configuration, DistinctIdentifier, Event, Enriched);
};

export const CaptureError = (
	Tag: string,
	Message: string,
	Extra: Properties = {},
): void => {
	if (!Configuration.Enabled) return;

	const Enriched = Enrich({
		...Extra,
		error_tag: Tag,
		error_message: Message,
	});

	const Browser = GetBrowser();

	if (Browser?.captureException) {
		try {
			Browser.captureException(new Error(`${Tag}: ${Message}`), Enriched);

			return;
		} catch {}
	}

	if (Browser?.capture) {
		try {
			Browser.capture("wind:error", Enriched);

			return;
		} catch {}
	}

	void Fallback(Configuration, DistinctIdentifier, "wind:error", Enriched);
};

export const Initialize = (): void => {
	if (!Configuration.Enabled) return;

	const Browser = GetBrowser();

	if (Browser?.register) {
		try {
			Browser.register(BaseProperties);
		} catch {}
	}

	CaptureEvent("wind:session:start", {
		userAgent:
			typeof navigator !== "undefined" ? navigator.userAgent : "node",
	});
};

export default { CaptureEvent, CaptureError, Initialize };
