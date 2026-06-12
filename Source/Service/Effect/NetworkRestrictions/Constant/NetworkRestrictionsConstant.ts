/**
 * @module Effect/NetworkRestrictions/Constant/NetworkRestrictionsConstant
 * @description
 * Constants and default values for the NetworkRestrictions service including default
 * configuration, endpoint lists, and IPC channel patterns.
 * @see {@link Effect/NetworkRestrictions/Type/NetworkRestrictionConfig} Related type
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Constant
 */

import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default network restrictions configuration - blocks all external network traffic
 * while allowing internal communication and specific whitelisted domains
 */
export const DEFAULT_NETWORK_RESTRICTIONS = {
	blockHTTP: true,

	blockHTTPS: true,

	blockWebSocket: true,

	blockMarketplace: true,

	blockExtensionUpdates: true,

	blockTelemetry: true,

	blockExtensionTelemetry: true,

	allowInternal: true,

	allowLocalhost: true,

	allowMountain: true,

	logBlocked: true,

	allowedDomains: [],

	blockedDomains: [
		// Microsoft telemetry endpoints
		"*.microsoft.com",

		"*.azureedge.net",

		"*.vscode.azure.net",

		"*.vscode-remote.azureedge.net",

		"*.vscode-remote.azureedge-extentions.azureedge.net",

		"*.vscode-extensions.azureedge.net",

		// Microsoft marketplace
		"*.marketplace.visualstudio.com",

		"*.marketplace.extensions.visualstudio.com",

		// Extension telemetry
		"*.gallery.vsassets.io",

		// Update servers
		"*.update.code.visualstudio.com",

		"*.vscode-update.azurewebsites.net",
	],
} satisfies NetworkRestrictionConfig;

// ============================================================================
// Endpoint Constants
// ============================================================================

/**
 * Common telemetry endpoints that should always be blocked
 */
export const TelemetryEndpoint = [
	"vortex.data.microsoft.com",

	"vortex.data.microsoft.com/collect/v1",

	"*.telemetry.vscode.azure.net",

	"*.vscode-extensions.azureedge.net",

	"*.vscode-telemetry.microsoft.com",
];

/**
 * Marketplace and extension endpoints that should be blocked
 */
export const MarketplaceEndpoint = [
	"*.marketplace.visualstudio.com",

	"*.marketplace.extensions.visualstudio.com",

	"*.gallery.vsassets.io",
];

/**
 * Update server endpoints that should be blocked
 */
export const UpdateEndpoint = [
	"*.update.code.visualstudio.com",

	"*.vscode-update.azurewebsites.net",
];

/**
 * AI and Copilot endpoints that should be blocked
 */
export const AiEndpoint = [
	"*.api.githubcopilot.com",

	"*.copilot.githubusercontent.com",
];

// ============================================================================
// IPC Channel Constants
// ============================================================================

/**
 * VSCode-specific IPC channels that SHOULD BE ALLOWED (internal)
 */
export const ALLOWED_IPC_CHANNELS = [
	"vscode:",

	"vscode:workspace",

	"vscode:file",

	"vscode:editor",

	"vscode:terminal",

	"vscode:debug",

	"vscode:sandbox",

	"vscode:mountain",

	"vscode:ipc",
];

/**
 * VSCode IPC channels that MUST BE BLOCKED (telemetry/external)
 */
export const BLOCKED_IPC_CHANNELS = [
	"vscode:telemetryAppender",

	"vscode:telemetryLog",

	"vscode:customEndpointTelemetry",

	"vscode:extensions.*",
];

const constants = {
	DEFAULT_NETWORK_RESTRICTIONS,

	TelemetryEndpoint,

	MarketplaceEndpoint,

	UpdateEndpoint,

	AiEndpoint,

	ALLOWED_IPC_CHANNELS,

	BLOCKED_IPC_CHANNELS,
} as const;

export default constants;
