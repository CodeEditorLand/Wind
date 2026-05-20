/**
 * @module Effect/Configuration/Implementation/ConfigurationImplementation
 * @description
 * Main implementation of Configuration service with reactive state management.
 * Provides production-ready implementation with telemetry and sync support.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */

import { Effect, Layer, Schedule, Stream, SubscriptionRef } from "effect";

import DevLog from "../../../Function/DevLog.js";
import {
	ConfigurationNotReadyError,
	type ISandboxConfiguration,
} from "../../../Types/Sandbox.js";
import { IPC } from "../../IPC.js";
import { MountainTag } from "../../Mountain.js";
import { Sandbox } from "../../Sandbox.js";
import { Telemetry } from "../../Telemetry.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import type { ConfigurationService } from "../Interface/ConfigurationService.js";
import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import { MakeApply, MakeValidate } from "./ConfigurationHelper.js";

// ============================================================================
// Live Implementation
// ============================================================================

/**
 * Live implementation layer for Configuration service.
 * Provides reactive configuration management with fetch and sync capabilities.
 */
export const ConfigurationLive = Layer.effect(
	ConfigurationTag,

	Effect.gen(function* () {
		const SandboxService = yield* Sandbox;
		const IPCService = yield* IPC;
		const Validate = MakeValidate();

		// Create subscription ref for reactive configuration
		const ConfigRef =
			yield* SubscriptionRef.make<ISandboxConfiguration | null>(null);

		// Atom: Fetch configuration from backend
		const Fetch = Effect.gen(function* () {
			// First try to get from sandbox context (already loaded by preload)
			const FromSandbox = yield* SandboxService.resolveConfiguration.pipe(
				Effect.either,
			);

			if (FromSandbox._tag === "Right") {
				return FromSandbox.right as ISandboxConfiguration;
			}

			// Fallback: fetch directly via IPC
			return yield* IPCService.invoke(
				"mountain_get_workbench_configuration",
			)([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
		}) as Effect.Effect<ISandboxConfiguration, ConfigFetchError>;

		// Atom: Apply configuration (zoom, userEnv)
		const Apply = MakeApply();

		// Stream of configuration changes
		const Changes = ConfigRef.changes.pipe(
			Stream.filter(
				(Config): Config is ISandboxConfiguration => Config !== null,
			),
		);

		// Atom: Get current configuration
		const Get = Effect.gen(function* () {
			const Current = yield* ConfigRef.get;
			if (!Current) {
				return yield* Effect.fail<ConfigurationNotReadyError>(
					new ConfigurationNotReadyError(),
				);
			}
			return Current;
		});

		// Atom: Refresh configuration from backend
		const Refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError> =
			Effect.gen(function* () {
				const Config = yield* Fetch;
				yield* SubscriptionRef.set(ConfigRef, Config);
				return Config;
			});

		// Initial fetch and set
		yield* Fetch.pipe(
			Effect.flatMap((Config) => SubscriptionRef.set(ConfigRef, Config)),
		);

		yield* Effect.log("[Configuration] Configuration service initialized");

		return {
			get: Get,
			fetch: Fetch,
			validate: Validate,
			apply: Apply,
			changes: Changes,
			refresh: Refresh,
		} satisfies ConfigurationService;
	}),
);

/**
 * Live implementation layer for Configuration service with Mountain sync.
 * Includes periodic sync with the Mountain backend.
 */
export const ConfigurationWithSyncLive = Layer.effect(
	ConfigurationTag,

	Effect.gen(function* () {
		const SandboxService = yield* Sandbox;
		const IPCService = yield* IPC;
		const Mountain = yield* MountainTag;
		const Validate = MakeValidate();
		const Apply = MakeApply();

		// Create subscription ref for reactive configuration
		const ConfigRef =
			yield* SubscriptionRef.make<ISandboxConfiguration | null>(null);

		// Atom: Fetch configuration from backend
		const Fetch = Effect.gen(function* () {
			// First try to get from sandbox context (already loaded by preload)
			const FromSandbox = yield* SandboxService.resolveConfiguration.pipe(
				Effect.either,
			);

			if (FromSandbox._tag === "Right") {
				return FromSandbox.right as ISandboxConfiguration;
			}

			// Fallback: fetch directly via IPC
			return yield* IPCService.invoke(
				"mountain_get_workbench_configuration",
			)([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
		}) as Effect.Effect<ISandboxConfiguration, ConfigFetchError>;

		// Stream of configuration changes
		const Changes = ConfigRef.changes.pipe(
			Stream.filter(
				(Config): Config is ISandboxConfiguration => Config !== null,
			),
		);

		// Atom: Get current configuration
		const Get = Effect.gen(function* () {
			const Current = yield* ConfigRef.get;
			if (!Current) {
				return yield* Effect.fail<ConfigurationNotReadyError>(
					new ConfigurationNotReadyError(),
				);
			}
			return Current;
		});

		// Atom: Refresh configuration from backend
		const Refresh: Effect.Effect<ISandboxConfiguration, ConfigFetchError> =
			Effect.gen(function* () {
				const Config = yield* Fetch;
				yield* SubscriptionRef.set(ConfigRef, Config);
				return Config;
			});

		// Initial fetch and set
		yield* Fetch.pipe(
			Effect.flatMap((Config) => SubscriptionRef.set(ConfigRef, Config)),
		);

		// Set up Mountain sync for reactive configuration updates
		yield* Effect.fork(
			Effect.gen(function* () {
				// Subscribe to Mountain connection changes
				const ConnectionState = yield* Mountain.connectionState;
				if (ConnectionState._tag === "Connected") {
					// Start periodic sync
					yield* Effect.repeat(
						Effect.gen(function* () {
							const Config = yield* Mountain.rpc(
								"mountain_get_configuration",
							)();
							if (Config) {
								yield* Validate(Config).pipe(
									Effect.flatMap((ValidatedConfig) => {
										return Effect.gen(function* () {
											const Current =
												yield* ConfigRef.get;
											if (
												!Current ||
												JSON.stringify(Current) !==
													JSON.stringify(
														ValidatedConfig,
													)
											) {
												yield* SubscriptionRef.set(
													ConfigRef,

													ValidatedConfig,
												);
												yield* Apply(ValidatedConfig);
											}
										});
									}),

									Effect.catchAll((error) =>
										Effect.sync(() => {
											DevLog(
												"config",
												"[Configuration] Sync error:",

												error,
											);
										}),
									),
								);
							}
						}),

						Schedule.spaced("5 seconds"),
					);
				}
			}),
		);

		yield* Effect.log(
			"[Configuration] Configuration service with sync initialized",
		);

		return {
			get: Get,
			fetch: Fetch,
			validate: Validate,
			apply: Apply,
			changes: Changes,
			refresh: Refresh,
		} satisfies ConfigurationService;
	}),
);

export default ConfigurationLive;
