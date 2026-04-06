/**
 * @module Effect/Environment/Implementation/EnvironmentHelper
 * @description
 * Helper functions for detecting platform, architecture, and environment settings.
 * Used by the Environment service implementation.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Main implementation
 * @category Implementation
 */

import type { Architecture, Platform } from "../Type/EnvironmentType.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect the current platform
 * @returns The detected platform type
 */
export const DetectPlatform = (): Platform => {
	if (typeof navigator === "undefined") {
		return "web";
	}

	const PlatformStr = navigator.platform?.toLowerCase() || "";

	if (PlatformStr.includes("win")) {
		return "win32";
	}
	if (PlatformStr.includes("mac")) {
		return "darwin";
	}
	if (PlatformStr.includes("linux") || PlatformStr.includes("ubuntu")) {
		return "linux";
	}

	return "web";
};

/**
 * Detect the current CPU architecture
 * @returns The detected architecture type
 */
export const DetectArchitecture = (): Architecture => {
	// Web platform doesn't expose architecture
	if (typeof navigator === "undefined") {
		return "web";
	}

	// Try to detect from user agent
	const UserAgent = navigator.userAgent.toLowerCase();
	if (UserAgent.includes("arm") || UserAgent.includes("aarch64")) {
		return "arm64";
	}

	// Default to x64 for web
	return "x64";
};

/**
 * Detect the current locale
 * @returns The detected locale string
 */
export const DetectLocale = (): string => {
	if (typeof navigator === "undefined") {
		return "en-US";
	}

	return navigator.language || "en-US";
};

/**
 * Detect the current timezone
 * @returns The detected timezone string
 */
export const DetectTimezone = (): string => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
};

/**
 * Get the user agent string
 * @returns The user agent string
 */
export const GetUserAgent = (): string => {
	if (typeof navigator === "undefined") {
		return "Unknown";
	}

	return navigator.userAgent || "Unknown";
};

const helpers = {
	DetectPlatform,
	DetectArchitecture,
	DetectLocale,
	DetectTimezone,
	GetUserAgent,
};

export default helpers;
