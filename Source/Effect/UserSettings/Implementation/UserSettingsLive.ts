/**
 * @module Effect/UserSettings/Implementation/UserSettingsLive
 * @description
 * Live implementation that bridges to the workbench's
 * `IConfigurationService` exposed on
 * `globalThis.__CEL_SERVICES__.Configuration` and the
 * `globalThis.__CEL_OVERRIDE_CONFIG__` bag the native
 * `InjectConfigurationOverlay` shim consults.
 *
 * Read path:
 *   1. If `Memory` writes have populated `__CEL_OVERRIDE_CONFIG__`
 *      for the section, the workbench's `getValue` short-circuits
 *      to the bag (handled by the native shim) - this layer just
 *      calls `getValue(section)` and trusts the cascade.
 *   2. Otherwise the workbench walks default → user → workspace →
 *      folder → override and returns the effective value.
 *
 * Write path:
 *   - `Memory` target: write to `__CEL_OVERRIDE_CONFIG__` directly,
 *     dispatch a `cel:user-settings-changed` DOM event so the
 *     `Changes` stream emits.
 *   - Other targets: forward to `updateValue(section, value, target)`
 *     on the workbench's `IConfigurationService`. The workbench
 *     emits its native `onDidChangeConfiguration` event; we listen
 *     and forward into `Changes`.
 *
 * Failure handling:
 *   - Bridge unavailable (the workbench hasn't started yet, or the
 *     `__CEL_SERVICES__` bag has a `null` for this key) ->
 *     `UserSettingsBridgeUnavailable`. The Layer doesn't `die`; it
 *     fails the Effect so callers can fall back to the Stub.
 * @category Implementation
 */

import { Effect, Layer, Stream } from "effect";

import type {
	UserSettingsChangeEvent,
	UserSettingsService,
	UserSettingsTarget,
} from "../Interface/UserSettingsService.js";
import { UserSettingsServiceTag } from "../Tag/UserSettingsServiceTag.js";
import type { UserSettingsProblem } from "../Type/UserSettingsProblem.js";

interface VSCodeConfigurationBridge {
	readonly getValue: <T>(section: string) => T | undefined;

	readonly updateValue: (
		section: string,

		value: unknown,

		target: number,
	) => Promise<void>;

	readonly inspect?: <T>(section: string) => {
		readonly userValue?: T;

		readonly defaultValue?: T;
	};

	readonly onDidChangeConfiguration: (
		listener: (event: { affectedKeys?: Iterable<string> }) => void,
	) => { readonly dispose: () => void };
}

interface CELGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Configuration?: VSCodeConfigurationBridge | null;
	};

	__CEL_OVERRIDE_CONFIG__?: Record<string, unknown>;
}

const ResolveBridge = Effect.sync(() => {
	const Globals = globalThis as unknown as CELGlobals;

	const Bridge = Globals.__CEL_SERVICES__?.Configuration ?? null;

	return Bridge;
});

const TargetCode = (Target: UserSettingsTarget): number => {
	// Mirrors VS Code's ConfigurationTarget enum (vs/platform/
	// configuration/common/configuration.ts):
	//   USER = 1, USER_LOCAL = 2, USER_REMOTE = 3, WORKSPACE = 4,
	//   WORKSPACE_FOLDER = 5, DEFAULT = 6, MEMORY = 7, APPLICATION = 8.
	switch (Target) {
		case "Application":
			return 8;

		case "Profile":
			return 1;

		case "Workspace":
			return 4;

		case "WorkspaceFolder":
			return 5;

		case "Memory":
			return 7;
	}
};

const WriteOverride = (Section: string, Value: unknown): void => {
	const Globals = globalThis as unknown as CELGlobals;

	if (!Globals.__CEL_OVERRIDE_CONFIG__) {
		Globals.__CEL_OVERRIDE_CONFIG__ = {};
	}

	Globals.__CEL_OVERRIDE_CONFIG__[Section] = Value;

	try {
		window.dispatchEvent(
			new CustomEvent("cel:user-settings-changed", {
				detail: { section: Section, source: "Memory" },
			}),
		);
	} catch {
		// happens in test contexts without a window object; safe to ignore
	}
};

export const UserSettingsLive = Layer.effect(
	UserSettingsServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const ProblemBridgeUnavailable: UserSettingsProblem = {
			_tag: "UserSettingsBridgeUnavailable",
			reason: "globalThis.__CEL_SERVICES__.Configuration is null - the workbench hasn't injected its handles yet. Boot the workbench first or use UserSettingsStub for tests.",
		};

		const Service: UserSettingsService = {
			Read: <T = unknown>(Section: string) =>
				Effect.gen(function* () {
					if (!Bridge) {
						return yield* Effect.fail(ProblemBridgeUnavailable);
					}

					try {
						const Value = Bridge.getValue<T>(Section);

						if (Value === undefined) {
							return yield* Effect.fail<UserSettingsProblem>({
								_tag: "UserSettingsReadFailed",
								section: Section,
								error: new Error(
									`Section "${Section}" missing from configuration cascade`,
								),
							});
						}

						return Value;
					} catch (Error) {
						return yield* Effect.fail<UserSettingsProblem>({
							_tag: "UserSettingsReadFailed",
							section: Section,
							error:
								Error instanceof globalThis.Error
									? Error
									: new globalThis.Error(String(Error)),
						});
					}
				}),
			ReadOptional: <T = unknown>(Section: string) =>
				Effect.gen(function* () {
					if (!Bridge) {
						return yield* Effect.fail(ProblemBridgeUnavailable);
					}

					return Bridge.getValue<T>(Section);
				}),
			Write: (Section, Value, Target: UserSettingsTarget) =>
				Effect.gen(function* () {
					if (Target === "Memory") {
						WriteOverride(Section, Value);

						return;
					}

					if (!Bridge) {
						return yield* Effect.fail(ProblemBridgeUnavailable);
					}

					yield* Effect.tryPromise({
						try: () =>
							Bridge.updateValue(
								Section,

								Value,

								TargetCode(Target),
							),
						catch: (Error) =>
							({
								_tag: "UserSettingsWriteRejected",
								section: Section,
								target: Target,
								reason:
									Error instanceof globalThis.Error
										? Error.message
										: String(Error),
							}) as UserSettingsProblem,
					});
				}),
			HasUserValue: (Section) =>
				Effect.gen(function* () {
					if (!Bridge?.inspect) {
						return yield* Effect.fail(ProblemBridgeUnavailable);
					}

					const Inspection = Bridge.inspect(Section);

					return Inspection.userValue !== undefined;
				}),
			Changes: Stream.async<UserSettingsChangeEvent, UserSettingsProblem>(
				(Emit) => {
					if (!Bridge) {
						Emit.failCause({
							_tag: "Fail",
							error: ProblemBridgeUnavailable,
						} as never);

						return Effect.void;
					}

					const Subscription = Bridge.onDidChangeConfiguration(
						(VSEvent) => {
							const Keys = new Set(VSEvent.affectedKeys ?? []);

							Emit.single({
								affectedKeys: Keys,
								source: "Workspace",
							});
						},
					);

					const OverrideListener = (Event: Event) => {
						const Detail = (
							Event as CustomEvent<{
								readonly section: string;

								readonly source: UserSettingsTarget;
							}>
						).detail;

						Emit.single({
							affectedKeys: new Set([Detail.section]),
							source: Detail.source,
						});
					};

					try {
						window.addEventListener(
							"cel:user-settings-changed",

							OverrideListener,
						);
					} catch {
						// no window - not registering, just clean up subscription
					}

					return Effect.sync(() => {
						Subscription.dispose();

						try {
							window.removeEventListener(
								"cel:user-settings-changed",

								OverrideListener,
							);
						} catch {
							// see above
						}
					});
				},
			),
		};

		return Service;
	}),
);

export default UserSettingsLive;
