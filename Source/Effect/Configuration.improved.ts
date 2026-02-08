/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service using Effect-TS with OpenTelemetry integration.
 */

import {
	Context, Effect, Layer, Schedule, Stream, SubscriptionRef, pipe,
} from "effect";

import {
	ConfigurationNotReadyError,
	type ISandboxConfiguration,
} from "../Types/Sandbox.js";
import { IPC } from "./IPC.js";
import { Sandbox } from "./Sandbox.js";
import { MountainTag } from "./Mountain.js";
import { TelemetryService } from "./Telemetry.js";

export class ConfigFetchError extends Error {
	readonly _tag = "ConfigFetchError";
	constructor(override readonly cause: unknown) {
		super("Failed to fetch configuration");
	}
}

export class ConfigValidationError extends Error {
	readonly _tag = "ConfigValidationError";
	constructor(readonly issues: ReadonlyArray<string>) {
		super("Configuration validation failed");
	}
}

export interface ConfigService { readonly _: unique symbol; }

export interface Config {
	readonly GetConfig: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
	readonly GetConfigKey: (key: string) => Effect.Effect<unknown, ConfigFetchError>;
	readonly SetConfigKey: (key: string, value: unknown) => Effect.Effect<void, Error>;
	readonly ReloadConfig: Effect.Effect<ISandboxConfiguration, ConfigFetchError>;
	readonly ConfigChanges: Stream.Stream<ISandboxConfiguration, never>;
}

const MakeConfig = (
	configRef: SubscriptionRef.SubscriptionRef<ISandboxConfiguration>,
): Config => ({
	GetConfig: configRef.get,

	GetConfigKey: (key: string) =>
		pipe(
			configRef.get,
			Effect.map((config) => (config as Record<string, unknown>)[key]),
		),

	SetConfigKey: (key: string, value: unknown) =>
		pipe(
			Effect.gen(function* (_) {
				const telemetry = yield* _(TelemetryService);
				const current = yield* _(configRef.get);
				const newConfig = { ...current, [key]: value };

				yield* _(Effect.logDebug(`[${Date.now()}] Set config key: ${key}`));
				
				yield* _(
					Effect.tryPromise({
						try: () => IPC.ipcRenderer.invoke("config.set", key, value),
						catch: (cause) => new Error(`Failed to set config: ${cause}`),
					}),
				);

				yield* _(SubscriptionRef.set(configRef, newConfig as ISandboxConfiguration));
				telemetry.RecordSpan("config.set", { key }, "info");
			}),
		),

	ReloadConfig:
		pipe(
			Effect.tryPromise({
				try: () => IPC.ipcRenderer.invoke("config.getAll"),
				catch: (cause) => new ConfigFetchError(cause),
			}),
			Effect.tap((config) =>
				SubscriptionRef.set(configRef, config as ISandboxConfiguration),
			),
		),

	ConfigChanges: configRef.changes,
});

export const ConfigLayerLive = Layer.effect(
	ConfigService,
	Effect.gen(function* (_) {
		const telemetry = yield* _(TelemetryService);

		const initialConfig = yield* _(
			pipe(
				Effect.tryPromise({
					try: () => IPC.ipcRenderer.invoke("config.getAll"),
					catch: (cause) => new ConfigFetchError(cause),
				}),
			),
		);

		const configRef = yield* _(SubscriptionRef.make(initialConfig as ISandboxConfiguration));

		yield* _(
			Effect.fork(
				pipe(
					IPC.Listen("config.changed", () => {}),
					Effect.flatMap(() => configRef.update((c) => ({ ...c }))),
					Effect.forever,
				),
			),
		);

		telemetry.RecordSpan("config.initialized", { keys: Object.keys(initialConfig).length }, "info");

		return MakeConfig(configRef);
	}),
);

export const ConfigLive = ConfigLayerLive;

export const GetConfig = Effect.serviceFunction(ConfigService, (s) => s.GetConfig);
export const SetConfigKey = (key: string, value: unknown) =>
	Effect.serviceFunction(ConfigService, (s) => s.SetConfigKey(key, value));
