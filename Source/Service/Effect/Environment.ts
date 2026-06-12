/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Replaces VSCode's platform detection from Stage0.
 *
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Live implementation
 * @category Service
 * @example
 * ```typescript
 * import { LiveEnvironmentService } from "./Service/Environment.js";
 *
 * const env = LiveEnvironmentService;
 * console.log("Platform:", env.getPlatform);
 * ```
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

import {
	LiveEnvironmentService,
	makeMockEnvironment,
	MockEnvironmentService,
} from "./Environment/index.js";

// Export as default and named for backward compatibility
export {
	LiveEnvironmentService as EnvironmentLive,
	MockEnvironmentService as EnvironmentMock,
	makeMockEnvironment,
} from "./Environment/index.js";

// Re-export types
export type {
	Platform,
	Architecture,
	EnvironmentInfo,
	EnvironmentService,
} from "./Environment/index.js";

// Re-export helper functions
export {
	DetectPlatform,
	DetectArchitecture,
	DetectLocale,
	DetectTimezone,
	GetUserAgent,
} from "./Environment/index.js";

// Backward compatibility
export const Environment = LiveEnvironmentService;

export type { EnvironmentInfo as Type } from "./Environment/index.js";
