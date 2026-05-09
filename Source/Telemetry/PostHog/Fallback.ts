/**
 * @module Telemetry/PostHog/Fallback
 * @description
 * `fetch`-based `/batch/` POST for node-side Wind layers where
 * `window.posthog` is unavailable. Matches Cocoon's envelope shape so
 * PostHog's server treats our direct POST identically to an SDK call.
 * Silent on failure - telemetry must never raise.
 */

import type { Configuration } from "./Configuration.js";
import BaseProperties, { type Properties } from "./Properties.js";

export default async (
	Config: Configuration,

	DistinctIdentifier: string,

	Event: string,

	Properties: Properties,
): Promise<void> => {
	if (typeof fetch === "undefined") return;

	try {
		await fetch(`${Config.Host}/batch/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				api_key: Config.Key,
				batch: [
					{
						event: Event,
						timestamp: new Date().toISOString(),
						distinct_id: DistinctIdentifier,
						properties: {
							...Properties,
							...BaseProperties,
							$app: "land-editor",
							$app_version: "0.0.1",
							$build_mode: "debug",
						},
					},
				],
			}),
		});
	} catch {
		// Telemetry must never raise.
	}
};
