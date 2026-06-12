/**
 * @module Effect/UserSettings/Interface/UserSettingsService
 * @description
 * Service interface for the workbench's user-tier
 * configuration (settings.json + workspace + folder + override).
 * Wraps VS Code's `IConfigurationService` exposed on
 * `globalThis.__CEL_SERVICES__.Configuration` and consults the
 * `globalThis.__CEL_OVERRIDE_CONFIG__` bag the native shim transform
 * (`InjectConfigurationOverlay`) installs.
 *
 * This is distinct from `Effect/Configuration` which deals with the
 * sandbox bootstrap config; the two concerns share a name only
 * because VS Code uses the same word for both.
 * @category Interface
 */

/**
 * Workbench-tier configuration target. Picks which layer of the
 * VS Code cascade a write affects.
 */
export type UserSettingsTarget =
	| "Application"
	| "Profile"
	| "Workspace"
	| "WorkspaceFolder"
	| "Memory";

export interface UserSettingsChangeEvent {
	readonly affectedKeys: ReadonlySet<string>;

	readonly source: UserSettingsTarget;
}

export interface UserSettingsService {
	/**
	 * Read a typed setting by section path. Returns the effective
	 * value after the cascade, **except** when
	 * `__CEL_OVERRIDE_CONFIG__[section]` is set, in which case the
	 * override bag wins (the native `InjectConfigurationOverlay`
	 * shim short-circuits the read at that point).
	 */
	readonly Read: <T = unknown>(section: string) => T;

	/**
	 * Like `Read` but yields `undefined` for missing sections
	 * instead of throwing. Useful for optional settings.
	 */
	readonly ReadOptional: <T = unknown>(section: string) => T | undefined;

	/**
	 * Write a setting at the given target layer. `Memory` writes
	 * the override bag (synchronous, no IPC, no disk write); other
	 * targets call the workbench's `updateValue(...)` and persist
	 * through Mountain.
	 */
	readonly Write: (
		section: string,

		value: unknown,

		target: UserSettingsTarget,
	) => Promise<void>;

	/**
	 * Inspect whether a section has any non-default value.
	 */
	readonly HasUserValue: (section: string) => boolean;

	/**
	 * Subscribe to configuration-change events. Each event lists the
	 * sections whose value changed; subscribers can read the new
	 * value with `Read(section)` after receiving an event.
	 */
	readonly Changes: (callback: (event: UserSettingsChangeEvent) => void) => {
		readonly dispose: () => void;
	};
}
