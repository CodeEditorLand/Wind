/**
 * @module Effect/UserSettings/Type/UserSettingsProblem
 * @description
 * Typed error ADT for the user-settings service. Each variant
 * carries the minimum diagnostic context the consumer needs to
 * recover (or surface to the user). Unlike the bootstrap
 * `ConfigurationService` errors (which deal with the sandbox
 * configuration handshake), these target the workbench-tier
 * `IConfigurationService` cascade
 * (default → user → workspace → folder → override).
 * @category Type
 */

export type UserSettingsProblem =
	| {
			readonly _tag: "UserSettingsBridgeUnavailable";
			readonly reason: string;
	  }
	| {
			readonly _tag: "UserSettingsReadFailed";
			readonly section: string;
			readonly error: Error;
	  }
	| {
			readonly _tag: "UserSettingsWriteRejected";
			readonly section: string;
			readonly target: string;
			readonly reason: string;
	  };
