/**
 * @module Telemetry/PostHog/Identifier
 * @description
 * Resolves the PostHog `distinct_id` for this Wind layer. Respects the
 * same `LAND_POSTHOG_DISTINCT_ID` seed the other tiers use so a single
 * dev session can correlate Sky / Wind / Cocoon / Mountain events under
 * one person.
 */

export default (Seed: string): string => {
	if (Seed.length > 0) return Seed;

	return `land-dev-wind-${Date.now()}`;
};
