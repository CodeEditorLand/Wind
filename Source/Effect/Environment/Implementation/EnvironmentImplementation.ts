/**
 * @module Effect/Environment/Implementation/EnvironmentImplementation
 * @description
 * Main implementation of the Environment service. Provides live and mock layers
 * for detecting platform, architecture, and environment settings.
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @see {@link Effect/Environment/Tag/EnvironmentTag} Service tag
 * @category Implementation
 * @example
 * ```typescript
 * import { EnvironmentLive } from "./Effect/Environment/Implementation/EnvironmentImplementation.js";
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

import { Effect, Layer } from "effect";
import { EnvironmentTag } from "../Tag/EnvironmentTag.js";
import type { EnvironmentService } from "../Interface/EnvironmentService.js";
import type { Platform, Architecture } from "../Type/EnvironmentType.js";
import {
  DetectPlatform,
  DetectArchitecture,
  DetectLocale,
  DetectTimezone,
  GetUserAgent,
} from "./EnvironmentHelper.js";

// ============================================================================
// Live Implementation
// ============================================================================

/**
 * Live environment service
 * Detects actual environment information from browser APIs
 */
const MakeLiveEnvironment: EnvironmentService = {
  getInfo: Effect.sync(() => ({
    platform: DetectPlatform(),
    architecture: DetectArchitecture(),
    locale: DetectLocale(),
    timezone: DetectTimezone(),
    userAgent: GetUserAgent(),
    isSecureContext: typeof window !== "undefined" && window.isSecureContext,
    language: DetectLocale().split("-")[0] || "en",
  })),
  getPlatform: Effect.sync(DetectPlatform),
  getArchitecture: Effect.sync(DetectArchitecture),
  isWindows: Effect.map(Effect.sync(DetectPlatform), (p) => p === "win32"),
  isMac: Effect.map(Effect.sync(DetectPlatform), (p) => p === "darwin"),
  isLinux: Effect.map(Effect.sync(DetectPlatform), (p) => p === "linux"),
  isWeb: Effect.map(Effect.sync(DetectPlatform), (p) => p === "web"),
};

/**
 * Live layer for Environment service
 */
export const EnvironmentLive = Layer.effect(
  EnvironmentTag,
  Effect.succeed(MakeLiveEnvironment),
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

/**
 * Create a mock environment service with custom overrides
 * @param overrides - Optional partial environment info to override defaults
 * @returns A mock environment service
 */
export const makeMockEnvironment = (
  overrides?: Partial<{
    readonly platform: Platform;
    readonly architecture: Architecture;
    readonly locale: string;
    readonly timezone: string;
    readonly userAgent: string;
    readonly isSecureContext: boolean;
    readonly language: string;
  }>,
): EnvironmentService => {
  const mockInfo = {
    platform: "web" as const,
    architecture: "x64" as const,
    locale: "en-US",
    timezone: "UTC",
    userAgent: "Mock",
    isSecureContext: true,
    language: "en",
    ...overrides,
  };

  return {
    getInfo: Effect.sync(() => mockInfo),
    getPlatform: Effect.sync(() => mockInfo.platform),
    getArchitecture: Effect.sync(() => mockInfo.architecture),
    isWindows: Effect.sync(() => mockInfo.platform === "win32"),
    isMac: Effect.sync(() => mockInfo.platform === "darwin"),
    isLinux: Effect.sync(() => mockInfo.platform === "linux"),
    isWeb: Effect.sync(() => mockInfo.platform === "web"),
  };
};

/**
 * Mock layer for Environment service
 */
export const EnvironmentMock = Layer.effect(
  EnvironmentTag,
  Effect.succeed(makeMockEnvironment()),
);

export default EnvironmentLive;
