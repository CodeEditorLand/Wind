/**
 * @module Telemetry/PostHogBridge
 * @description
 * Wind-side PostHog telemetry bridge. Atom PH4.
 *
 * Wind runs inside the same webview as Sky - the Sky-side bridge already
 * owns the `posthog-js` instance on `window.posthog`. Wind doesn't load
 * its own SDK; it reuses the Sky one so there's a single PostHog client
 * per webview (avoids double-capture and keeps the rate-limiter honest).
 *
 * When Wind runs outside a webview (rare - Node-side Wind layers for
 * extension dev-loops), falls back to direct `fetch` against the
 * `/batch` endpoint with the same shape as Cocoon's bridge.
 *
 * Every event is tagged `$tier: "wind"` so the same PostHog project can
 * slice by tier without changing key.
 */

type EventProperties = Record<string, unknown>;

const ReadEnvString = (Key: string, Fallback: string): string => {
	const Value = (import.meta as any)?.env?.[Key];
	if (typeof Value === "string" && Value.length > 0) return Value;
	if (typeof process !== "undefined" && process.env?.[Key]) {
		return process.env[Key] as string;
	}
	return Fallback;
};

const PostHogKey = ReadEnvString(
	"LAND_POSTHOG_KEY",
	"phc_mCwHy7LgvbnEqh6a2DyMiLUJcaZvmmj7JNmmpQzvr7mA",
);
const PostHogHost = ReadEnvString(
	"LAND_POSTHOG_HOST",
	"https://eu.i.posthog.com",
);
const PostHogEnabled =
	ReadEnvString("LAND_POSTHOG_WIND_ENABLED", "true") !== "false";

const DistinctIdSeed = ReadEnvString("LAND_POSTHOG_DISTINCT_ID", "");
const FallbackDistinctId =
	DistinctIdSeed.length > 0
		? DistinctIdSeed
		: `land-dev-wind-${Date.now()}`;

type WindowWithPostHog = Window & {
	posthog?: {
		capture?: (Event: string, Properties?: EventProperties) => void;
		captureException?: (
			Error: unknown,
			Properties?: EventProperties,
		) => void;
		register?: (Properties: EventProperties) => void;
	};
};

const GetBrowserPostHog = (): WindowWithPostHog["posthog"] | undefined => {
	if (typeof window === "undefined") return undefined;
	return (window as WindowWithPostHog).posthog;
};

const CaptureAllowed = (): boolean => {
	if (!PostHogEnabled) return false;
	return true;
};

const PostBatch = async (
	Event: string,
	Properties: EventProperties,
): Promise<void> => {
	if (typeof fetch === "undefined") return;
	try {
		await fetch(`${PostHogHost}/batch/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				api_key: PostHogKey,
				batch: [
					{
						event: Event,
						timestamp: new Date().toISOString(),
						distinct_id: FallbackDistinctId,
						properties: {
							...Properties,
							$app: "land-editor",
							$app_version: "0.0.1",
							$build_mode: "debug",
							$component: "wind",
							$tier: "wind",
							$lib: "wind-posthog-bridge",
						},
					},
				],
			}),
		});
	} catch {
		// Telemetry must never raise.
	}
};

/**
 * Capture a named event. Routes through `window.posthog` if Sky's bridge
 * has already loaded it; otherwise POSTs directly to `/batch`. Either
 * path adds `$tier: "wind"` so downstream filters distinguish sources.
 */
export const CaptureEvent = (
	Event: string,
	Properties: EventProperties = {},
): void => {
	if (!CaptureAllowed()) return;
	const TaggedProperties: EventProperties = {
		...Properties,
		$tier: "wind",
		$component: "wind",
	};
	const Browser = GetBrowserPostHog();
	if (Browser?.capture) {
		try {
			Browser.capture(Event, TaggedProperties);
			return;
		} catch {
			// Fall through to HTTP fallback.
		}
	}
	void PostBatch(Event, TaggedProperties);
};

export const CaptureError = (
	Tag: string,
	Message: string,
	Extra: EventProperties = {},
): void => {
	if (!CaptureAllowed()) return;
	const TaggedProperties: EventProperties = {
		...Extra,
		error_tag: Tag,
		error_message: Message,
		$tier: "wind",
		$component: "wind",
	};
	const Browser = GetBrowserPostHog();
	if (Browser?.captureException) {
		try {
			Browser.captureException(new Error(`${Tag}: ${Message}`), TaggedProperties);
			return;
		} catch {}
	}
	if (Browser?.capture) {
		try {
			Browser.capture("wind:error", TaggedProperties);
			return;
		} catch {}
	}
	void PostBatch("wind:error", TaggedProperties);
};

export const Initialize = (): void => {
	if (!CaptureAllowed()) return;
	const Browser = GetBrowserPostHog();
	if (Browser?.register) {
		try {
			Browser.register({
				$tier: "wind",
				$lib: "wind-posthog-bridge",
			});
		} catch {}
	}
	CaptureEvent("wind:session:start", {
		userAgent:
			typeof navigator !== "undefined" ? navigator.userAgent : "node",
	});
};

export default {
	CaptureEvent,
	CaptureError,
	Initialize,
};
