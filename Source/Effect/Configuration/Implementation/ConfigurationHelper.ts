/**
 * @module Effect/Configuration/Implementation/ConfigurationHelper
 * @description
 * Helper functions for Configuration service implementation.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Main implementation
 * @category Implementation
 */

import { Effect, Stream } from "effect";

import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import type { ConfigSchemaIssue } from "../Type/ConfigurationSchemaType.js";
import { ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
import type { TelemetryService } from "../../Telemetry.js";

// ============================================================================
// Validation Helper
// ============================================================================

/**
 * Validates configuration structure and returns schema issues if any.
 */
const validateConfig = (config: unknown): ReadonlyArray<ConfigSchemaIssue> => {
	const issues: ConfigSchemaIssue[] = [];

	if (!config || typeof config !== "object") {
		issues.push({ path: "", message: "Configuration must be an object" });
		return issues;
	}

	const cfg = config as Record<string, unknown>;

	// Validate zoomLevel if present
	if (cfg["zoomLevel"] !== undefined) {
		if (typeof cfg["zoomLevel"] !== "number") {
			issues.push({ path: "zoomLevel", message: "Must be a number" });
		} else if (cfg["zoomLevel"] < -10 || cfg["zoomLevel"] > 10) {
			issues.push({
				path: "zoomLevel",
				message: "Must be between -10 and 10",
			});
		}
	}

	// Validate userEnv if present
	if (cfg["userEnv"] !== undefined && typeof cfg["userEnv"] !== "object") {
		issues.push({ path: "userEnv", message: "Must be an object" });
	}

	// Validate workspace if present
	if (cfg["workspace"] !== undefined) {
		if (typeof cfg["workspace"] !== "object" || cfg["workspace"] === null) {
			issues.push({ path: "workspace", message: "Must be an object" });
		} else {
			const ws = cfg["workspace"] as Record<string, unknown>;
			if (ws["id"] !== undefined && typeof ws["id"] !== "string") {
				issues.push({
					path: "workspace.id",
					message: "Must be a string",
				});
			}
			if (ws["uri"] !== undefined && typeof ws["uri"] !== "string") {
				issues.push({
					path: "workspace.uri",
					message: "Must be a string",
				});
			}
		}
	}

	return issues;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates the validate effect implementation.
 */
const makeValidate = () => {
	return (
		config: unknown,
	): Effect.Effect<ISandboxConfiguration, ConfigValidationError> =>
		Effect.sync(() => validateConfig(config)).pipe(
			Effect.flatMap((issues) =>
				issues.length > 0
					? Effect.fail(
							new ConfigValidationError(
								issues.map((i) => `${i.path}: ${i.message}`),
							),
						)
					: Effect.succeed(config as ISandboxConfiguration),
			),
		);
};

/**
 * Creates the apply effect implementation.
 */
const makeApply = () => {
	return (
		config: ISandboxConfiguration,
	): Effect.Effect<void, ConfigApplyError> =>
		Effect.gen(function* () {
			// Apply zoom level
			if (config.zoomLevel !== undefined) {
				yield* Effect.try({
					try: () => {
						if (window && (window as any).vscode) {
							(window as any).vscode.postMessage({
								type: "setZoomLevel",
								payload: config.zoomLevel,
							});
						}
					},
					catch: (error) => new ConfigApplyError("zoomLevel", error),
				});
			}

			// Apply user environment variables
			if (config.userEnv) {
				for (const [key, value] of Object.entries(config.userEnv || {})) {
					yield* Effect.try({
						try: () => {
							if (typeof process !== "undefined" && process.env) {
								process.env[key] = value as string;
							}
						},
						catch: (error) => new ConfigApplyError(key, error),
					});
				}
			}
		});
};

/**
 * Get configuration value with path (dot notation).
 */
const getConfigValue = <T>(
	config: ISandboxConfiguration,
	path: string,
): T | undefined => {
	const parts = path.split(".");
	let current: unknown = config;

	for (const part of parts) {
		if (current && typeof current === "object" && part in current) {
			current = (current as Record<string, unknown>)[part];
		} else {
			return undefined;
		}
	}

	return current as T | undefined;
};

export {
	validateConfig,
	makeValidate,
	makeApply,
	getConfigValue,
};
