/**
 * @module Effect/Configuration
 * @description
 * Atomic configuration service.
 * Consolidates configuration fetching, validation, and reactive updates.
 * Replaces duplicated logic in Preload, MountainIntegrationService, and MountainWindSync.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Configuration/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { ConfigurationLive } from "./Effect/Configuration.js";
 *
 * // New (recommended):
 * import { ConfigurationLive } from "./Effect/Configuration/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	ConfigFetchError,
	ConfigValidationError,
	ConfigApplyError,
	type ConfigSchemaIssue,
	type ConfigurationService,
	type ConfigurationTag,
	type Configuration,
	ValidateConfiguration,
	MakeValidate,
	MakeApply,
	GetConfigValue,
	CreateConfigurationService,
	ConfigurationLive,
	ConfigurationWithSyncLive,
	ConfigurationMock,
	makeMockConfiguration,
} from "./Configuration/index.js";
