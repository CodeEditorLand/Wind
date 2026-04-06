// Convenience alias for backward compatibility
import { ConfigurationTag } from "./Tag/ConfigurationTag.js";

/**
 * @module Effect/Configuration
 * @description
 * Main re-export module for Configuration service.
 * Provides atomic exports for configuration management.
 *
 * @example
 * ```ts
 * import { Configuration, ConfigurationLive, ConfigurationTag } from "./Effect/Configuration/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const configuration = yield* ConfigurationTag;
 *   const config = yield* configuration.get;
 *   return config;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(ConfigurationLive));
 * ```
 *
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */

// Error types
export { default as ConfigFetchError } from "./Error/ConfigFetchError.js";
export { default as ConfigValidationError } from "./Error/ConfigValidationError.js";
export { default as ConfigApplyError } from "./Error/ConfigApplyError.js";

// Type definitions
export type { ConfigSchemaIssue } from "./Type/ConfigurationSchemaType.js";

// Service interface
export type { ConfigurationService } from "./Interface/ConfigurationService.js";

// Service tag
export { ConfigurationTag } from "./Tag/ConfigurationTag.js";

// Helper functions
export {
	ValidateConfiguration,
	MakeValidate,
	MakeApply,
	GetConfigValue,
} from "./Implementation/ConfigurationHelper.js";

// Live implementation layer
export {
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "./Implementation/ConfigurationImplementation.js";

// Mock implementation layer
export {
	ConfigurationMock,
	makeMockConfiguration,
} from "./Layer/ConfigurationMock.js";

export { ConfigurationTag as Configuration };
