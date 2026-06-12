/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Provides detection of platform, architecture, locale, and other environment settings.
 *
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Live implementation
 * @category Service
 * @example
 * ```typescript
 * import { LiveEnvironmentService } from "./Service/Environment/index.js";
 *
 * const env = LiveEnvironmentService;
 * console.log("Platform:", env.getPlatform);
 * ```
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Types
export type { Platform, Architecture } from "./Type/EnvironmentType.js";

export type { EnvironmentInfo } from "./Type/EnvironmentType.js";

// Interface
export type { EnvironmentService } from "./Interface/EnvironmentService.js";

// Implementation
export {
	LiveEnvironmentService as default,
	LiveEnvironmentService,
	MockEnvironmentService,
	makeMockEnvironment,
} from "./Implementation/EnvironmentImplementation.js";

// Helpers
export {
	DetectPlatform,
	DetectArchitecture,
	DetectLocale,
	DetectTimezone,
	GetUserAgent,
} from "./Implementation/EnvironmentHelper.js";
