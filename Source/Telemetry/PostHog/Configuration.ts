/**
 * @module Telemetry/PostHog/Configuration
 * @description
 * Reads Wind's PostHog configuration from `import.meta.env` (injected by
 * Vite's `define`) with a `process.env` fallback for node-side layers.
 * Key + host default to the shipped Land project so a fresh clone still
 * reports without `.env.Land.PostHog`.
 */

export type Configuration = {
	readonly Key: string;

	readonly Host: string;

	readonly Enabled: boolean;

	readonly DistinctIdentifierSeed: string;
};

const DefaultKey = "";

const DefaultHost = "https://eu.i.posthog.com";

const ReadString = (Key: string, Fallback: string): string => {
	const FromImportMeta = (import.meta as { env?: Record<string, unknown> })
		?.env?.[Key];

	if (typeof FromImportMeta === "string" && FromImportMeta.length > 0) {
		return FromImportMeta;
	}

	if (typeof process !== "undefined" && process.env?.[Key]) {
		return process.env[Key] as string;
	}

	return Fallback;
};

// `Capture=false` is the master telemetry kill switch shared with
// Mountain / Cocoon / Sky / Output / Build.sh. Distinct from
// `.env.Land.Diagnostics`'s `Disable` (polyfill / shim kill switch).
const TelemetryCaptureEnabled = ReadString("Capture", "true") !== "false";

export default (): Configuration => ({
	Key: ReadString("Authorize", DefaultKey),
	Host: ReadString("Beam", DefaultHost),
	Enabled:
		TelemetryCaptureEnabled && ReadString("Report", "true") !== "false",
	DistinctIdentifierSeed: ReadString("Brand", ""),
});
