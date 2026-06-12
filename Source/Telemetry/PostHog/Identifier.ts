/**
 * @module Telemetry/PostHog/Identifier
 * @description
 * Resolves the PostHog `distinct_id` for this Wind layer. Respects the
 * same `Brand` seed the other tiers use so a single
 * dev session can correlate Sky / Wind / Cocoon / Mountain events under
 * one person.
 */

export default (Seed: string): string => {
	if (Seed.length > 0) return Seed;

	const Username =
		process.env["USER"] ?? process.env["USERNAME"] ?? "unknown";

	return `land-dev-wind-${Username}`;
};
