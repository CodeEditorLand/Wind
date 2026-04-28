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

export default (): Configuration => ({
	Key: ReadString("Authorize", DefaultKey),
	Host: ReadString("Beam", DefaultHost),
	Enabled: ReadString("Report", "true") !== "false",
	DistinctIdentifierSeed: ReadString("Brand", ""),
});
