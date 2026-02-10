/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsHelper
 * @description
 * Helper functions for NetworkRestrictions implementation. Provides URL and IPC channel
 * checking logic used by the main service implementation.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Main implementation
 * @category Implementation
 */

import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";
import {
	TELEMETRY_ENDP,
	MARKETPLACE_ENDP,
	UPDATE_ENDP,
	AI_ENDPOINTP,
	ALLOWED_IPC_CHANNELS,
	BLOCKED_IPC_CHANNELS,
} from "../Constant/NetworkRestrictionsConstant.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if URL is internal (localhost, Mountain backend, etc.)
 * @param config - The current network restriction configuration
 * @param url - The URL to check
 * @returns true if the URL is internal and should be allowed
 */
export const isInternalURL = (config: NetworkRestrictionConfig, url: string): boolean => {
	try {
		const urlObj = new URL(url);
		
		// Allow localhost
		if (
			urlObj.hostname === 'localhost' ||
			urlObj.hostname === '127.0.0.1' ||
			urlObj.hostname === '::1'
		) {
			return true;
		}

		// Check if Mountain backend
		if (config.allowMountain &&
		    (urlObj.hostname.includes('localhost') ||
		     urlObj.hostname === '127.0.0.1' ||
		     urlObj.port !== undefined)) {
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
export const isBlockedURL = (config: NetworkRestrictionConfig, url: string): boolean => {
	// Check telemetry endpoints
	if (config.blockTelemetry) {
		for (const pattern of TELEMETRY_ENDP) {
			if (url.includes(pattern)) {
				return true;
			}
		}
	}

	// Check blocked domains
	if (config.blockedDomains.length > 0) {
		for (const pattern of config.blockedDomains) {
			if (url.includes(pattern)) {
				return true;
			}
		}
	}

	// Check specific patterns manually
	if (url.includes('telemetry') ||
	    url.includes('telemetryAppender') ||
	    url.includes('vortex')) {
		return true;
	}

	// Check marketplace
	if (config.blockMarketplace) {
		for (const pattern of MARKETPLACE_ENDP) {
			if (url.includes('marketplace') || url.includes('extensions')) {
				return true;
			}
		}
	}

	// Check updates
	if (config.blockExtensionUpdates) {
		for (const pattern of UPDATE_ENDP) {
			if (url.includes('update') || url.includes('vscode-update')) {
				return true;
			}
		}
	}

	// Check AI endpoints
	for (const pattern of AI_ENDPOINTP) {
		if (url.includes('github.com') || url.includes('copilot')) {
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
export const isAllowedURL = (config: NetworkRestrictionConfig, url: string): boolean => {
	if (config.allowedDomains.length === 0) {
		return false;
	}

	for (const pattern of config.allowedDomains) {
		if (url.includes(pattern)) {
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
export const isIPCAllowed = (channel: string): boolean => {
	// Must start with vscode:
	if (!channel.startsWith('vscode:')) {
		return false;
	}

	// Check if in explicitly blocked list
	for (const pattern of BLOCKED_IPC_CHANNELS) {
		if (channel.startsWith(pattern)) {
			return false;
		}
	}

	// Allow internal VSCode channels
	for (const allowed of ALLOWED_IPC_CHANNELS) {
		if (channel.startsWith(allowed)) {
			return true;
		}
	}

	return false;
};

const helpers = {
	isInternalURL,
	isBlockedURL,
	isAllowedURL,
	isIPCAllowed,
};

export default helpers;
