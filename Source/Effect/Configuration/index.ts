/**
 * @module Effect/Configuration
 * @description
 * Main re-export module for Configuration service.
 * Provides atomic exports for configuration management.
 *
 * @example
 * ```ts
 * import { ConfigurationLive } from "./Effect/Configuration/index.js";
 *
 * const Config = await ConfigurationLive.refresh();
 *
 * const Subscription = ConfigurationLive.onChange((Next) => {
 * 	// react to configuration changes
 * });
 *
 * Subscription.dispose();
 * ```
 *
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see {@link Effect/Configuration/Implementation/ConfigurationImplementation} Live implementation
 * @category Service
 */

// Error types
export { default as ConfigFetchError } from "./Error/ConfigFetchError.js";

export { default as ConfigValidationError } from "./Error/ConfigValidationError.js";

export { default as ConfigApplyError } from "./Error/ConfigApplyError.js";

// Type definitions
export type { ConfigSchemaIssue } from "./Type/ConfigurationSchemaType.js";

// Service interface
export type {
	ConfigurationService,
	IDisposable,
} from "./Interface/ConfigurationService.js";

// Service type alias (former Context.Tag; consumers use the live object)
export type { ConfigurationTag } from "./Tag/ConfigurationTag.js";

export type { ConfigurationTag as Configuration } from "./Tag/ConfigurationTag.js";

// Helper functions
export {
	ValidateConfiguration,
	MakeValidate,
	MakeApply,
	GetConfigValue,
} from "./Implementation/ConfigurationHelper.js";

// Live implementation
export {
	CreateConfigurationService,
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "./Implementation/ConfigurationImplementation.js";

// Mock implementation
export {
	ConfigurationMock,
	makeMockConfiguration,
} from "./Layer/ConfigurationMock.js";
