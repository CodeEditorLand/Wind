/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service using Effect-TS.
 * Consolidates configuration fetching, validation, and reactive updates.
 * Replaces duplicated logic in Preload, MountainIntegrationService, and MountainWindSync.
 */

import {
	Context,
	Effect,
	Layer,
	Stream,
	SubscriptionRef,
} from "effect";

import {
	ConfigurationNotReadyError,
	type ISandboxConfiguration,
} from "../Types/Sandbox.js";
import { IPC } from "./IPC.js";
import { Sandbox } from "./Sandbox.js";

// ============================================================================
// Configuration Error Types
// ============================================================================

export class ConfigFetchError extends Error {
	readonly _tag = "ConfigFetchError";
	constructor(override readonly cause: unknown) {
		super(`Failed to fetch configuration: ${String(cause)}`);
	}
}

export class ConfigValidationError extends Error {
	readonly _tag = "ConfigValidationError";
	constructor(readonly issues: ReadonlyArray<string>) {
		super(`Configuration validation failed: ${issues.join(", ")}`);
	}
}

export class ConfigApplyError extends Error {
	readonly _tag = "ConfigApplyError";
	constructor(
		readonly key: string,
		override readonly cause: unknown,
	) {
		super(`Failed to apply configuration for '${key}': ${String(cause)}`);
	}
}

// ============================================================================
// Configuration Schema Validation
// ============================================================================

interface ConfigSchemaIssue {
	readonly path: string;
	readonly message: string;
}

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
// Configuration Service Interface
// ============================================================================

export interface ConfigurationService {
	/** Get current configuration snapshot */
	readonly get: Effect.Effect<
		ISandboxConfiguration,
		ConfigurationNotReadyError
	>;

	/** Fetch configuration from backend */
	readonly fetch: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;

	/** Validate configuration structure */
	readonly validate: (
		config: unknown,
	) => Effect.Effect<ISandboxConfiguration, ConfigValidationError>;

	/** Apply configuration (zoom, userEnv, etc.) */
	readonly apply: (
		config: ISandboxConfiguration,
	) => Effect.Effect<void, ConfigApplyError>;

	/** Stream of configuration changes */
	readonly changes: Stream.Stream<ISandboxConfiguration, never>;

	/** Force refresh configuration from backend */
	readonly refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
}

export class ConfigurationTag extends Context.Tag("Configuration")<
	ConfigurationTag,
	ConfigurationService
>() {}

export const Configuration = ConfigurationTag;

// ============================================================================
// Implementation
// ============================================================================

export const ConfigurationLive = Layer.effect(
	Configuration,
	Effect.gen(function* () {
		const sandbox = yield* Sandbox;
		const ipc = yield* IPC;

		// Create subscription ref for reactive configuration
		const configRef =
			yield* SubscriptionRef.make<ISandboxConfiguration | null>(null);

		// Atom: Fetch configuration from backend
		const fetch = Effect.gen(function* () {
			// First try to get from sandbox context (already loaded by preload)
			const fromSandbox = yield* sandbox.resolveConfiguration.pipe(
				Effect.either,
			);

			if (fromSandbox._tag === "Right") {
				return fromSandbox.right as ISandboxConfiguration;
			}

			// Fallback: fetch directly via IPC
			return yield* ipc
				.invoke("mountain_get_workbench_configuration")([])
				.pipe(Effect.mapError((error) => new ConfigFetchError(error)));
		}) as Effect.Effect<ISandboxConfiguration, ConfigFetchError>;

		// Atom: Validate configuration
		const validate = (
			config: unknown,
		): Effect.Effect<ISandboxConfiguration, ConfigValidationError> =>
			Effect.sync(() => validateConfig(config)).pipe(
				Effect.flatMap((issues) =>
					issues.length > 0
						? Effect.fail(
								new ConfigValidationError(
									issues.map(
										(i) => `${i.path}: ${i.message}`,
									),
								),
							)
						: Effect.succeed(config as ISandboxConfiguration),
				),
			);

		// Atom: Apply configuration (zoom, userEnv)
		const apply = (
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

		// Stream of configuration changes
		const changes = configRef.changes.pipe(
			Stream.filter((config): config is ISandboxConfiguration => config !== null),
		);

		// Atom: Get current configuration
		const get = Effect.gen(function* () {
			const current = yield* configRef.get;
			if (!current) {
				return yield* Effect.fail<ConfigurationNotReadyError>(
					new ConfigurationNotReadyError(),
				);
			}
			return current;
		});

		// Atom: Refresh configuration from backend
		const refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError> = Effect.gen(function* () {
			const config = yield* fetch;
			yield* SubscriptionRef.set(configRef, config);
			return config;
		});

		// Initial fetch and set
		yield* fetch.pipe(Effect.flatMap((config) => SubscriptionRef.set(configRef, config)));

		yield* Effect.log("[Configuration] Configuration service initialized");

		return {
			get,
			fetch,
			validate,
			apply,
			changes,
			refresh,
		};
	}),
);

// ============================================================================
// Helper: Get configuration value with path
// ============================================================================

export const getConfigValue = <T>(
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

// ============================================================================
// Mock Implementation
// ============================================================================

export const makeMockConfiguration = (
	overrides?: Partial<ISandboxConfiguration>,
): ConfigurationService => {
	const mockConfig: ISandboxConfiguration = {
	zoomLevel: 0,
	userEnv: {},
	workspace: {
		id: "mock-workspace",
		uri: "mock://workspace",
		name: "Mock Workspace",
	},
	...overrides,
};

	return {
		get: Effect.succeed(mockConfig),
		fetch: Effect.succeed(mockConfig),
		validate: (config) =>
			Effect.sync(() => {
				const issues = validateConfig(config);
				if (issues.length > 0) {
					return Effect.fail(new ConfigValidationError(issues.map((i) => `${i.path}: ${i.message}`)));
				}
				return Effect.succeed(config as ISandboxConfiguration);
			}).pipe(Effect.flatten),
		apply: () => Effect.void,
		changes: Stream.empty,
		refresh: Effect.succeed(mockConfig),
	};
};

export const ConfigurationMock = Layer.succeed(
	Configuration,
	makeMockConfiguration(),
);
