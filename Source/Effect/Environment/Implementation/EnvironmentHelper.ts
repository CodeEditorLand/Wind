/**
 * @module Effect/Environment/Implementation/EnvironmentHelper
 * @description
 * Helper functions for detecting platform, architecture, and environment settings.
 * Used by the Environment service implementation.
 * @see {@link Effect/Environment/Implementation/EnvironmentImplementation} Main implementation
 * @category Implementation
 */

import type { Platform, Architecture } from "../Type/EnvironmentType.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect the current platform
 * @returns The detected platform type
 */
export const detectPlatform = (): Platform => {
	if (typeof navigator === "undefined") {
		return "web";
	}

	const platform = navigator.platform?.toLowerCase() || "";

	if (platform.includes("win")) {
		return "win32";
	}
	if (platform.includes("mac")) {
		return "darwin";
	}
	if (platform.includes("linux") || platform.includes("ubuntu")) {
		return "linux";
	}

	return "web";
};

/**
 * Detect the current CPU architecture
 * @returns The detected architecture type
 */
export const detectArchitecture = (): Architecture => {
	// Web platform doesn't expose architecture
	if (typeof navigator === "undefined") {
		return "web";
	}

	// Try to detect from user agent
	const userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.includes("arm") || userAgent.includes("aarch64")) {
		return "arm64";
	}

	// Default to x64 for web
	return "x64";
};

/**
 * Detect the current locale
 * @returns The detected locale string
 */
export const detectLocale = (): string => {
	if (typeof navigator === "undefined") {
		return "en-US";
	}

	return navigator.language || "en-US";
};

/**
 * Detect the current timezone
 * @returns The detected timezone string
 */
export const detectTimezone = (): string => {
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
export const getUserAgent = (): string => {
	if (typeof navigator === "undefined") {
		return "Unknown";
	}

	return navigator.userAgent || "Unknown";
};

const helpers = {
	detectPlatform,
	detectArchitecture,
	detectLocale,
	detectTimezone,
	getUserAgent,
};

export default helpers;
