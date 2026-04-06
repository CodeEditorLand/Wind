/**
 * @module Effect/Environment
 * @description
 * Environment service for platform detection and environment setup.
 * Provides detection of platform, architecture, locale, and other environment settings.
 *
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Live implementation
 * @see {@link Effect/Environment/Tag/EnvironmentTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import { EnvironmentLive, EnvironmentTag } from "./Effect/Environment/index.js";
 * import { Effect } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const env = yield* EnvironmentTag;
 *   const info = yield* env.getInfo;
 *   console.log("Platform:", info.platform);
 * });
 *
 * Effect.runPromise(program.pipe(Effect.provide(EnvironmentLive)));
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

// Tag
export { EnvironmentTag } from "./Tag/EnvironmentTag.js";

// Implementation
export {
	EnvironmentLive as default,
	EnvironmentLive,
	EnvironmentMock,
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
