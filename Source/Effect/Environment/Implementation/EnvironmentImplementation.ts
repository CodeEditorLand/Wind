/**
 * @module Effect/Environment/Implementation/EnvironmentImplementation
 * @description
 * Main implementation of the Environment service. Provides live and mock layers
 * for detecting platform, architecture, and environment settings.
 * @see {@link Effect/Environment/Interface/EnvironmentService} Service interface
 * @category Implementation
 * @example
 * ```typescript
 * import { LiveEnvironmentService } from "./Effect/Environment/Implementation/EnvironmentImplementation.js";
 *
 * const env = LiveEnvironmentService;
 * console.log("Platform:", env.getPlatform);
 * ```
 */

import type { EnvironmentService } from "../Interface/EnvironmentService.js";
import type { Architecture, Platform } from "../Type/EnvironmentType.js";
import {
	DetectArchitecture,
	DetectLocale,
	DetectPlatform,
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
	getInfo: {
		platform: DetectPlatform(),
		architecture: DetectArchitecture(),
		locale: DetectLocale(),
		timezone: DetectTimezone(),
		userAgent: GetUserAgent(),
		isSecureContext:
			typeof window !== "undefined" && window.isSecureContext,
		language: DetectLocale().split("-")[0] || "en",
	},

	getPlatform: DetectPlatform(),

	getArchitecture: DetectArchitecture(),

	isWindows: DetectPlatform() === "win32",

	isMac: DetectPlatform() === "darwin",

	isLinux: DetectPlatform() === "linux",

	isWeb: DetectPlatform() === "web",
};

export const LiveEnvironmentService = MakeLiveEnvironment;

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
		getInfo: mockInfo,

		getPlatform: mockInfo.platform,

		getArchitecture: mockInfo.architecture,

		isWindows: mockInfo.platform === "win32",

		isMac: mockInfo.platform === "darwin",

		isLinux: mockInfo.platform === "linux",

		isWeb: mockInfo.platform === "web",
	};
};

export const MockEnvironmentService = makeMockEnvironment();

export default LiveEnvironmentService;
