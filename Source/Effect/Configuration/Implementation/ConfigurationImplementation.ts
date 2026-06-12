/**
 * @module Effect/Configuration/Implementation/ConfigurationImplementation
 * @description
 * Main implementation of Configuration service with reactive state management.
 * Holds the current configuration in module state and notifies registered
 * listeners on every replacement.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @category Implementation
 */

import { invoke as TauriInvoke } from "@tauri-apps/api/core";

import DevLog from "../../../Function/DevLog.js";

import {
	ConfigurationNotReadyError,
	type ISandboxConfiguration,
} from "../../../Types/Sandbox.js";

import { ConfigFetchError } from "../Error/ConfigFetchError.js";

import type {
	ConfigurationService,
	IDisposable,
} from "../Interface/ConfigurationService.js";

import { MakeApply, MakeValidate } from "./ConfigurationHelper.js";

// ============================================================================
// Live Implementation
// ============================================================================

interface SandboxConfigurationContext {

	readonly resolveConfiguration?: () => Promise<ISandboxConfiguration>;
}

/**
 * Creates the Configuration service.
 * State lives in the closure: a current snapshot plus a listener set that is
 * notified whenever the snapshot is replaced.
 */
export const CreateConfigurationService = (): ConfigurationService => {

	let Current: ISandboxConfiguration | null = null;

	const Listeners = new Set<(Config: ISandboxConfiguration) => void>();

	const Validate = MakeValidate();

	const Apply = MakeApply();

	const Fetch = async (): Promise<ISandboxConfiguration> => {
		// First try to get from sandbox context (already loaded by preload)
		const Context = (
			window as unknown as {
				vscode?: { context?: SandboxConfigurationContext };
			}
		).vscode?.context;

		if (
			Context &&
			typeof Context.resolveConfiguration === "function"
		) {
			try {
				return await Context.resolveConfiguration();
			} catch (Error) {
				DevLog(
					"config",

					"[Configuration] Sandbox resolveConfiguration failed, falling back to IPC:",

					Error,
				);
			}
		}

		// Fallback: fetch directly via IPC
		try {
			return (await TauriInvoke("MountainIPCInvoke", {
				method: "mountain_get_workbench_configuration",
				params: [],
			})) as ISandboxConfiguration;
		} catch (Error) {
			throw new ConfigFetchError(Error);
		}
	};

	const Replace = (Config: ISandboxConfiguration): void => {
		Current = Config;

		for (const Listener of Listeners) {
			try {
				Listener(Config);
			} catch (Error) {
				DevLog("config", "[Configuration] Listener failed:", Error);
			}
		}
	};

	const Get = (): ISandboxConfiguration => {
		if (!Current) {
			throw new ConfigurationNotReadyError();
		}

		return Current;
	};

	const Refresh = async (): Promise<ISandboxConfiguration> => {
		const Config = await Fetch();

		Replace(Config);

		return Config;
	};

	const OnChange = (
		Listener: (Config: ISandboxConfiguration) => void,
	): IDisposable => {
		Listeners.add(Listener);

		return {
			dispose: () => {
				Listeners.delete(Listener);
			},
		};
	};

	return {
		get: Get,

		fetch: Fetch,

		validate: Validate,

		apply: Apply,

		replace: Replace,

		onChange: OnChange,

		refresh: Refresh,
	} satisfies ConfigurationService;
};

/**
 * Live Configuration service singleton.
 * Configuration is loaded on the first `refresh()` call (Bootstrap stage 2)
 * and kept in sync by the Mountain service's background configuration sync.
 */
export const ConfigurationLive: ConfigurationService =
	CreateConfigurationService();

/**
 * Mountain-driven configuration sync now lives in the Mountain service
 * (it validates, replaces, and applies fetched configuration while
 * connected), so the sync variant is the same service instance.
 */
export const ConfigurationWithSyncLive: ConfigurationService =
	ConfigurationLive;

export default ConfigurationLive;
