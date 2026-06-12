/**
 * @module Effect/Configuration/Layer/ConfigurationMock
 * @description
 * Mock implementation for Configuration service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @category Layer
 */

import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import { MakeValidate } from "../Implementation/ConfigurationHelper.js";
import type {
	ConfigurationService,
	IDisposable,
} from "../Interface/ConfigurationService.js";

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Creates a mock configuration service for testing.
 */
export const makeMockConfiguration = (
	overrides?: Partial<ISandboxConfiguration>,
): ConfigurationService => {
	const validate = MakeValidate();

	let mockConfig: ISandboxConfiguration = {
		zoomLevel: 0,

		userEnv: {},

		workspace: {
			id: "mock-workspace",

			uri: "mock://workspace",

			name: "Mock Workspace",
		},
		...overrides,
	};

	const listeners = new Set<(Config: ISandboxConfiguration) => void>();

	return {
		get: () => mockConfig,

		fetch: async () => mockConfig,

		validate,

		apply: () => undefined,

		replace: (Config: ISandboxConfiguration) => {
			mockConfig = Config;

			for (const Listener of listeners) {
				Listener(Config);
			}
		},

		onChange: (
			Listener: (Config: ISandboxConfiguration) => void,
		): IDisposable => {
			listeners.add(Listener);

			return {
				dispose: () => {
					listeners.delete(Listener);
				},
			};
		},

		refresh: async () => mockConfig,
	} satisfies ConfigurationService;
};

/**
 * Mock Configuration service instance.
 * Provides simple no-op implementation for testing.
 */
export const ConfigurationMock: ConfigurationService = makeMockConfiguration();

export default ConfigurationMock;
