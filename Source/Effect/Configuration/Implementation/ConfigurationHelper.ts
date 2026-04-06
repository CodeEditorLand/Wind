/**
 * @module Effect/Configuration/Implementation/ConfigurationHelper
 * @description
 * Helper functions for Configuration service implementation.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Main implementation
 * @category Implementation
 */

import { Effect, Stream } from "effect";

import {
	ConfigurationNotReadyError,
	type ISandboxConfiguration,
} from "../../../Types/Sandbox.js";
import type { TelemetryService } from "../../Telemetry.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import type { ConfigSchemaIssue } from "../Type/ConfigurationSchemaType.js";

// ============================================================================
// Validation Helper
// ============================================================================

/**
 * Validates configuration structure and returns schema issues if any.
 */
const ValidateConfiguration = (
	Config: unknown,
): ReadonlyArray<ConfigSchemaIssue> => {
	const Issues: ConfigSchemaIssue[] = [];

	if (!Config || typeof Config !== "object") {
		Issues.push({ path: "", message: "Configuration must be an object" });
		return Issues;
	}

	const ConfigData = Config as Record<string, unknown>;

	// Validate zoomLevel if present
	if (ConfigData["zoomLevel"] !== undefined) {
		if (typeof ConfigData["zoomLevel"] !== "number") {
			Issues.push({ path: "zoomLevel", message: "Must be a number" });
		} else if (
			ConfigData["zoomLevel"] < -10 ||
			ConfigData["zoomLevel"] > 10
		) {
			Issues.push({
				path: "zoomLevel",
				message: "Must be between -10 and 10",
			});
		}
	}

	// Validate userEnv if present
	if (
		ConfigData["userEnv"] !== undefined &&
		typeof ConfigData["userEnv"] !== "object"
	) {
		Issues.push({ path: "userEnv", message: "Must be an object" });
	}

	// Validate workspace if present
	if (ConfigData["workspace"] !== undefined) {
		if (
			typeof ConfigData["workspace"] !== "object" ||
			ConfigData["workspace"] === null
		) {
			Issues.push({ path: "workspace", message: "Must be an object" });
		} else {
			const Workspace = ConfigData["workspace"] as Record<
				string,
				unknown
			>;
			if (
				Workspace["id"] !== undefined &&
				typeof Workspace["id"] !== "string"
			) {
				Issues.push({
					path: "workspace.id",
					message: "Must be a string",
				});
			}
			if (
				Workspace["uri"] !== undefined &&
				typeof Workspace["uri"] !== "string"
			) {
				Issues.push({
					path: "workspace.uri",
					message: "Must be a string",
				});
			}
		}
	}

	return Issues;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates the validate effect implementation.
 */
const MakeValidate = () => {
	return (
		Config: unknown,
	): Effect.Effect<ISandboxConfiguration, ConfigValidationError> =>
		Effect.sync(() => ValidateConfiguration(Config)).pipe(
			Effect.flatMap((Issues) =>
				Issues.length > 0
					? Effect.fail(
							new ConfigValidationError(
								Issues.map(
									(Issue) =>
										`${Issue.path}: ${Issue.message}`,
								),
							),
						)
					: Effect.succeed(Config as ISandboxConfiguration),
			),
		);
};

/**
 * Creates the apply effect implementation.
 */
const MakeApply = () => {
	return (
		Config: ISandboxConfiguration,
	): Effect.Effect<void, ConfigApplyError> =>
		Effect.gen(function* () {
			// Apply zoom level
			if (Config.zoomLevel !== undefined) {
				yield* Effect.try({
					try: () => {
						if (window && (window as any).vscode) {
							(window as any).vscode.postMessage({
								type: "setZoomLevel",
								payload: Config.zoomLevel,
							});
						}
					},
					catch: (Error) => new ConfigApplyError("zoomLevel", Error),
				});
			}

			// Apply user environment variables
			if (Config.userEnv) {
				for (const [Key, Value] of Object.entries(
					Config.userEnv || {},
				)) {
					yield* Effect.try({
						try: () => {
							if (typeof process !== "undefined" && process.env) {
								process.env[Key] = Value as string;
							}
						},
						catch: (Error) => new ConfigApplyError(Key, Error),
					});
				}
			}
		});
};

/**
 * Get configuration value with path (dot notation).
 */
const GetConfigValue = <T>(
	Config: ISandboxConfiguration,
	Path: string,
): T | undefined => {
	const Parts = Path.split(".");
	let Current: unknown = Config;

	for (const Part of Parts) {
		if (Current && typeof Current === "object" && Part in Current) {
			Current = (Current as Record<string, unknown>)[Part];
		} else {
			return undefined;
		}
	}

	return Current as T | undefined;
};

export { ValidateConfiguration, MakeValidate, MakeApply, GetConfigValue };
