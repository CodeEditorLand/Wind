/**
 * @module Effect/Environment/Interface/EnvironmentService
 * @description
 * Service interface for environment detection and platform information.
 * Provides methods to detect platform, architecture, and environment settings.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Implementation
 * @category Interface
 */

import type { Architecture, Platform } from "../Type/EnvironmentType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Environment service interface
 */
export interface EnvironmentService {
	/** Get comprehensive environment information */
	readonly getInfo: {
		readonly platform: Platform;

		readonly architecture: Architecture;

		readonly locale: string;

		readonly timezone: string;

		readonly userAgent: string;

		readonly isSecureContext: boolean;

		readonly language: string;
	};

	/** Get platform type */
	readonly getPlatform: Platform;

	/** Get architecture type */
	readonly getArchitecture: Architecture;

	/** Check if running on Windows */
	readonly isWindows: boolean;

	/** Check if running on macOS */
	readonly isMac: boolean;

	/** Check if running on Linux */
	readonly isLinux: boolean;

	/** Check if running in web environment */
	readonly isWeb: boolean;
}
