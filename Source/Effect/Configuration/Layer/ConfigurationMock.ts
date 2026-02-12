/**
 * @module Effect/Configuration/Layer/ConfigurationMock
 * @description
 * Mock implementation layer for Configuration service.
 * Used in testing and development scenarios.
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @see [Effect-TS Mocking](https://effect.website/docs/guide/testing)
 * @category Layer
 */

import { Effect, Layer, Stream } from "effect";

import { ConfigurationTag } from "../Tag/ConfigurationTag.js";
import type { ConfigurationService } from "../Interface/ConfigurationService.js";
import type { ISandboxConfiguration } from "../../../Types/Sandbox.js";
import { MakeValidate } from "../Implementation/ConfigurationHelper.js";

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
	const mockConfig: ISandboxConfiguration = {
	zoomLevel: 0,
	userEnv: {},
	workspace: {
		id: "mock-workspace",
		uri: "mock://workspace",
		name: "Mock Workspace",
	},
	...overrides,
};

	return {
		get: Effect.succeed(mockConfig),
		fetch: Effect.succeed(mockConfig),
		validate,
		apply: () => Effect.void,
		changes: Stream.empty,
		refresh: Effect.succeed(mockConfig),
	} satisfies ConfigurationService;
};

/**
 * Mock implementation layer for Configuration service.
 * Provides simple no-op implementation for testing.
 */
export const ConfigurationMock = Layer.succeed(
	ConfigurationTag,
	makeMockConfiguration(),
);

export default ConfigurationMock;
