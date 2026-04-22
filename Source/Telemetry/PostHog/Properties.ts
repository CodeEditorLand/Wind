/**
 * @module Telemetry/PostHog/Properties
 * @description
 * Wind-tier base properties merged into every event. `$tier` + `$component`
 * distinguish Wind from Sky/Cocoon/Mountain events inside the single
 * shared PostHog project.
 */

export type Properties = Record<string, unknown>;

export default {
	$tier: "wind",
	$component: "wind",
	$lib: "wind-posthog-bridge",
};
