/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsHelper
 * @description
 * Helper functions for NetworkRestrictions implementation. Provides URL and IPC channel
 * checking logic used by the main service implementation.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Main implementation
 * @category Implementation
 */

import {
	AiEndpoint,
	ALLOWED_IPC_CHANNELS,
	BLOCKED_IPC_CHANNELS,
	MarketplaceEndpoint,
	TelemetryEndpoint,
	UpdateEndpoint,
} from "../Constant/NetworkRestrictionsConstant.js";

import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if URL is internal (localhost, Mountain backend, etc.)
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL is internal and should be allowed
 */
export const IsInternalURL = (
	Config: NetworkRestrictionConfig,

	Url: string,
): boolean => {

	try {
		const UrlObj = new URL(Url);

		// Allow localhost
		if (
			UrlObj.hostname === "localhost" ||
			UrlObj.hostname === "127.0.0.1" ||
			UrlObj.hostname === "::1"
		) {
			return true;
		}

		// Check if Mountain backend
		if (
			Config.allowMountain &&
			(UrlObj.hostname.includes("localhost") ||
				UrlObj.hostname === "127.0.0.1" ||
				UrlObj.port !== undefined)
		) {
			return true;
		}

		return false;
	} catch {
		return false;
	}
};

/**
 * Check if URL matches any blocked patterns
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL should be blocked
 */
export const IsBlockedURL = (
	Config: NetworkRestrictionConfig,

	Url: string,
): boolean => {

	// Check telemetry endpoints
	if (Config.blockTelemetry) {
		for (const Pattern of TelemetryEndpoint) {
			if (Url.includes(Pattern)) {
				return true;
			}
		}
	}

	// Check blocked domains
	if (Config.blockedDomains.length > 0) {
		for (const Pattern of Config.blockedDomains) {
			if (Url.includes(Pattern)) {
				return true;
			}
		}
	}

	// Check specific patterns manually
	if (
		Url.includes("telemetry") ||
		Url.includes("telemetryAppender") ||
		Url.includes("vortex")
	) {
		return true;
	}

	// Check marketplace
	if (Config.blockMarketplace) {
		for (const Pattern of MarketplaceEndpoint) {
			if (Url.includes("marketplace") || Url.includes("extensions")) {
				return true;
			}
		}
	}

	// Check updates
	if (Config.blockExtensionUpdates) {
		for (const Pattern of UpdateEndpoint) {
			if (Url.includes("update") || Url.includes("vscode-update")) {
				return true;
			}
		}
	}

	// Check AI endpoints
	for (const Pattern of AiEndpoint) {
		if (Url.includes("github.com") || Url.includes("copilot")) {
			return true;
		}
	}

	return false;
};

/**
 * Check if URL matches any allowed patterns (whitelist)
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL is in the whitelist
 */
export const IsAllowedURL = (
	Config: NetworkRestrictionConfig,

	Url: string,
): boolean => {

	if (Config.allowedDomains.length === 0) {
		return false;
	}

	for (const Pattern of Config.allowedDomains) {
		if (Url.includes(Pattern)) {
			return true;
		}
	}

	return false;
};

/**
 * Check if IPC channel is allowed
 * @param channel - The IPC channel to check
 * @returns true if the IPC channel is allowed
 */
export const IsIPCAllowed = (Channel: string): boolean => {

	// Must start with vscode:
	if (!Channel.startsWith("vscode:")) {
		return false;
	}

	// Check if in explicitly blocked list
	for (const Pattern of BLOCKED_IPC_CHANNELS) {
		if (Channel.startsWith(Pattern)) {
			return false;
		}
	}

	// Allow internal VSCode channels
	for (const Allowed of ALLOWED_IPC_CHANNELS) {
		if (Channel.startsWith(Allowed)) {
			return true;
		}
	}

	return false;
};

const helpers = {

	IsInternalURL,

	IsBlockedURL,

	IsAllowedURL,

	IsIPCAllowed,
};

export default helpers;
