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

import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import type { ConfigurationService } from "../Interface/ConfigurationService.js";
import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import { ConfigurationNotReadyError } from "../../../Types/Sandbox.js";
import { ConfigFetchError } from "../Error/ConfigFetchError.js";
import { ConfigApplyError } from "../Error/ConfigApplyError.js";
import { ConfigValidationError } from "../Error/ConfigValidationError.js";
import { IPC } from "../../IPC.js";
import { Sandbox } from "../../Sandbox.js";
import { MountainTag } from "../../Mountain.js";
import { Telemetry } from "../../Telemetry.js";
import { makeValidate, makeApply } from "./ConfigurationHelper.js";

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
		const sandbox = yield* Sandbox;
		const ipc = yield* IPC;
		const validate = makeValidate();

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

		// Atom: Apply configuration (zoom, userEnv)
		const apply = makeApply();

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
		const sandbox = yield* Sandbox;
		const ipc = yield* IPC;
		const mountain = yield* MountainTag;
		const validate = makeValidate();
		const apply = makeApply();

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

		// Set up Mountain sync for reactive configuration updates
		yield* Effect.fork(
			Effect.gen(function* () {
				// Subscribe to Mountain connection changes
				const connectionState = yield* mountain.connectionState;
				if (connectionState._tag === "Connected") {
					// Start periodic sync
					yield* Effect.repeat(
						Effect.gen(function* () {
							const config = yield* mountain.rpc("mountain_get_configuration")();
							if (config) {
								yield* validate(config).pipe(
									Effect.flatMap((validatedConfig) => {
										return Effect.gen(function* () {
											const current = yield* configRef.get;
											if (!current || JSON.stringify(current) !== JSON.stringify(validatedConfig)) {
												yield* SubscriptionRef.set(configRef, validatedConfig);
												yield* apply(validatedConfig);
											}
										});
									}),
									Effect.catchAll((error) =>
										Effect.sync(() => {
											console.error("[Configuration] Sync error:", error);
										})
									)
								);
							}
						}),
						Schedule.spaced("5 seconds")
					);
				}
			})
		);

		yield* Effect.log("[Configuration] Configuration service with sync initialized");

		return {
			get,
			fetch,
			validate,
			apply,
			changes,
			refresh,
		} satisfies ConfigurationService;
	}),
);

export default ConfigurationLive;
