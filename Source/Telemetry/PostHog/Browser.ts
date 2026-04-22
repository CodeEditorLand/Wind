/**
 * @module Telemetry/PostHog/Browser
 * @description
 * Looks up the `posthog-js` client Sky installs on `window.posthog`.
 * Wind piggybacks on Sky's instance (one client per webview keeps the
 * rate-limiter honest and avoids double-capture).
 */

import type { Properties } from "./Properties.js";

export type BrowserClient = {
	readonly capture?: (Event: string, Properties?: Properties) => void;
	readonly captureException?: (
		Error: unknown,
		Properties?: Properties,
	) => void;
	readonly register?: (Properties: Properties) => void;
};

type WindowWithPostHog = Window & { posthog?: BrowserClient };

export default (): BrowserClient | undefined => {
	if (typeof window === "undefined") return undefined;

	return (window as WindowWithPostHog).posthog;
};
