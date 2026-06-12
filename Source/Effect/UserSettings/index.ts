/**
 * @module Effect/UserSettings
 * @description
 * Public surface of the user-settings Wind service. Re-exports the
 * tag, interface, problems, and both Layer implementations.
 *
 * Use `UserSettingsLive` in production (bridges to the workbench's
 * `IConfigurationService` via `globalThis.__CEL_SERVICES__`).
 * Use `MakeUserSettingsStub` in unit tests (in-memory only).
 * @category Public
 */

export { UserSettingsLive } from "./Implementation/UserSettingsLive.js";
export { MakeUserSettingsStub } from "./Implementation/UserSettingsStub.js";
export type {
	UserSettingsChangeEvent,
	UserSettingsService,
	UserSettingsTarget,
} from "./Interface/UserSettingsService.js";
export type {
	UserSettings,
	UserSettingsServiceTag,
} from "./Tag/UserSettingsServiceTag.js";
export type { UserSettingsProblem } from "./Type/UserSettingsProblem.js";
