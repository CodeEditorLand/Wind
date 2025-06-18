/*
 * File: Wind/Source/Application/Configuration/Definition.ts
 * Responsibility: Provides a read-only implementation of the VS Code configuration service (IConfigurationService) for the Cocoon sidecar, initializing its state by resolving configuration data via an Effect.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Orchestrate/ResolveConfiguration.js, effect, vs/base/common/event.js
 */

/**
 * @module Definition (Configuration)
 * @description A read-only implementation of IConfigurationService that fetches its
 * data on initialization via a composed Effect.
 */

import { Effect } from "effect";
import { Emitter } from "vs/base/common/event.js";
import type {
	IConfigurationService,
	IConfigurationValue,
} from "vs/platform/configuration/common/configuration.js";

import { ResolveConfiguration } from "./Orchestrate/ResolveConfiguration.js";

/**
 * A robust helper function to retrieve a nested property from a configuration object
 * using a dot-separated key string.
 *
 * @param ConfigurationObject - The root configuration object.
 * @param Key - The dot-separated key (e.g., 'workbench.editor.fontSize').
 * @returns The value if found, otherwise `undefined`.
 */
const GetValueFromObject = (ConfigurationObject: any, Key: string): any => {
	if (
		typeof ConfigurationObject !== "object" ||
		ConfigurationObject === null
	) {
		return undefined;
	}
	return Key.split(".").reduce(
		(current, part) => (current ? current[part] : undefined),
		ConfigurationObject,
	);
};

/**
 * An Effect that builds the live, read-only implementation of the Configuration service.
 */
const Definition = Effect.gen(function* (_) {
	// Fetch the fully merged configuration data from the integration layer on startup.
	const ConfigurationData = yield* _(ResolveConfiguration);

	const Service: IConfigurationService = {
		_serviceBrand: undefined,

		/**
		 * Gets a configuration value.
		 */
		getValue<T>(section?: string, overrides?: any): T {
			if (!section) {
				return ConfigurationData as T;
			}
			// Use our robust helper to find the nested value.
			return GetValueFromObject(ConfigurationData, section) as T;
		},

		// --- Stubs for read-write and complex inspection methods ---
		// A full implementation would require RPC calls to Mountain.

		updateValue: () => Promise.resolve(),
		inspect: <T>(key: string, overrides?: any): IConfigurationValue<T> => {
			const value = Service.getValue(key, overrides);
			return {
				key,
				value,
				defaultValue: value, // Stub
				userValue: value, // Stub
				workspaceValue: value, // Stub
				workspaceFolderValue: value, // Stub
			};
		},
		keys: () => ({
			default: [],
			user: [],
			workspace: [],
			workspaceFolder: [],
		}),
		reloadConfiguration: () => Promise.resolve(),
		onDidChangeConfiguration: new Emitter<any>().event,
	};

	return Service;
});

export default Definition;
