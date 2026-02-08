/**
 * @module Effect/NetworkRestrictions
 * @description
 * Atomic Network Restrictions service using Effect-TS.
 * Blocks all external network traffic from VSCode workbench and extensions.
 */

import { Effect, Layer, Context, Ref } from "effect";

import { Telemetry } from "./Telemetry.js";

// ============================================================================
// Network Restriction Error Types
// ============================================================================

export class NetworkBlockError extends Error {
	readonly _tag = "NetworkBlockError";
	constructor(readonly url: string, readonly reason: string) {
		super(`Network request blocked: ${reason}`);
		this.url = url;
		this.cause = url;
		Object.setPrototypeOf(this, NetworkBlockError.prototype);
	}
	override get name() { return "NetworkBlockError"; }
}

export class IPCBlockError extends Error {
	readonly _tag = "IPCBlockError";
	constructor(readonly channel: string, readonly reason: string) {
		super(`IPC channel blocked: ${reason}`);
		this.channel = channel;
		this.cause = channel;
		Object.setPrototypeOf(this, IPCBlockError.prototype);
	}
	override get name() { return "IPCBlockError"; }
}

// ============================================================================
// Network Restriction Configuration
// ============================================================================

export interface NetworkRestrictionConfig {
	/** Block all HTTP requests */
	readonly blockHTTP: boolean;
	/** Block all HTTPS requests */
	readonly blockHTTPS: boolean;
	/** Block WebSocket connections */
	readonly blockWebSocket: boolean;
	/** Block extension marketplace requests */
	readonly blockMarketplace: boolean;
	/** Block extension update checks */
	readonly blockExtensionUpdates: boolean;
	/**
	 * Allow specific domains (whitelist)
	 * Examples: ['localhost', '127.0.0.1', 'company-internal.com']
	 */
	readonly allowedDomains: Array<string>;
	/**
	 * Block specific domains (blacklist)
	 * Examples: ['telemetry.vscode.azure.net', 'marketplace.visualstudio.com']
	 */
	readonly blockedDomains: Array<string>;
	/** Block all telemetry endpoints */
	readonly blockTelemetry: boolean;
	/** Block extension telemetry */
	readonly blockExtensionTelemetry: boolean;
	/** Allow internal communication */
	readonly allowInternal: boolean;
	/** Allow localhost development connections */
	readonly allowLocalhost: boolean;
	/** Allow connections to Mountain backend */
	readonly allowMountain: boolean;
	/**
	 * Log blocked requests for debugging (internal only)
	 */
	readonly logBlocked: boolean;
}

export const DEFAULT_NETWORK_RESTRICTIONS: NetworkRestrictionConfig = {
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
};

/**
 * Common telemetry endpoints that should always be blocked
 */
export const TELEMETRY_ENDP: string[] = [
	"vortex.data.microsoft.com",
	"vortex.data.microsoft.com/collect/v1",
	"*.telemetry.vscode.azure.net",
	"*.vscode-extensions.azureedge.net",
	"*.vscode-telemetry.microsoft.com",
];

/**
 * Marketplace and extension endpoints that should be blocked
 */
export const MARKETPLACE_ENDP: string[] = [
	"*.marketplace.visualstudio.com",
	"*.marketplace.extensions.visualstudio.com",
	"*.gallery.vsassets.io",
];

/**
 * Update server endpoints that should be blocked
 */
export const UPDATE_ENDP: string[] = [
	"*.update.code.visualstudio.com",
	"*.vscode-update.azurewebsites.net",
];

/**
 * AI and Copilot endpoints that should be blocked
 */
export const AI_ENDPOINTP: string[] = [
	"*.api.githubcopilot.com",
	"*.copilot.githubusercontent.com",
];

/**
 * VSCode-specific IPC channels that SHOULD BE ALLOWED (internal)
 */
export const ALLOWED_IPC_CHANNELS: string[] = [
	"vscode:",
	"vscode:workspace",
	"vscode:file",
	"// VSCode:editor",
	"// VSCode:terminal",
	"// VSCode:debug",
	"// VSCode:sandbox",
	"// VSCode:mountain",
	// VSCode:ipc",
];

/**
 * VSCode IPC channels that MUST BE BLOCKED (telemetry/external)
 */
export const BLOCKED_IPC_CHANNELS: string[] = [
	"vscode:telemetryAppender",
	"vscode:telemetryLog",
	"vscode:customEndpointTelemetry"
	"// "vscode:extensions.*", - extension-specific channels will be blocked at service level
];

// ============================================================================
// Network Restriction Service Interface
// ============================================================================

export interface NetworkRestrictionsService {
	/** Check if a URL is allowed */
	readonly checkURL: (url: string) => Effect.Effect<boolean, NetworkBlockError>;

	/** Block a URL (used by window.fetch override) */
 readonly blockURL: (url: string, reason: string) => Effect.Effect<void, never>;

	/** Check if an IPC channel is allowed */
	readonly checkIPCChannel: (
		channel: string,
	) => Effect.Effect<boolean, IPCBlockError>;

	/** Get current configuration */
	readonly config: Effect.Effect<NetworkRestrictionConfig, never>;

	/** Update configuration (atomic) */
	readonly updateConfig: (
		config: Partial<NetworkRestrictionConfig>,
	) => Effect.Effect<void, never>;

	/** Get list of blocked requests (for debugging) */
	readonly getBlockedRequests: Effect.Effect<Array<{
		readonly timestamp: number;
		readonly type: 'http' | 'https' | 'websocket' | 'ipc';
		readonly target: string;
		readonly reason: string;
	}>, never>;

	/** Clear blocked requests log */
	readonly clearBlockedRequests: Effect.Effect<void, never>;

	/** Set telemetry level ( NONE, CRASH, ERROR, USAGE ) */
	readonly setTelemetryLevel: (level: 'NONE' | 'CRASH' | 'ERROR' | 'USAGE') => Effect.Effect<void, never>;

	/** Get current telemetry level */
	readonly getTelemetryLevel: Effect.Effect<'NONE' | 'CRASH' | 'ERROR' | 'USAGE', never>;
}

export class NetworkRestrictionsTag extends Context.Tag(
	"NetworkRestrictions",
)<NetworkRestrictionsTag, NetworkRestrictionsService>() {}

export const NetworkRestrictions = NetworkRestrictionsTag;

// ============================================================================
// Implementation
// ============================================================================

export const NetworkRestrictionsLive = Layer.effect(
	NetworkRestrictions,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// Current configuration as ref
		const configRef = yield* Ref.make<NetworkRestrictionConfig>(
			JSON.parse(JSON.stringify(DEFAULT_NETWORK_RESTRICTIONS)),
		);

		// Blocked requests log (for internal debugging only)
		const blockedRequestsRef = yield* Ref.make<
			Array<{
				readonly timestamp: number;
				readonly type: 'http' | 'https' | 'websocket' | 'ipc';
				readonly target: string;
				readonly reason: string;
			}>
		>([]);

		// Check if URL is internal (localhost, Mountain backend, etc.)
		const isInternalURL = (url: string): boolean => {
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
				if (configRef.value.allowMountain && 
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

		// Check if URL matches any blocked patterns
		const isBlockedURL = (url: string): boolean => {
			// Check telemetry endpoints
			if (configRef.value.blockTelemetry) {
				for (const pattern of TELEMETRY_ENDP) {
					if (url.includes(pattern)) {
						return true;
					}
				}
			}

			// Check blocked domains
			if (configRef.value.blockedDomains.length > 0) {
				for (const pattern of configRef.value.blockedDomains) {
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
			if (configRef.value.blockMarketplace) {
				for (const pattern of MARKETPLACE_ENDP) {
					if (url.includes('marketplace') || url.includes('extensions')) {
						return true;
					}
				}
			}

			// Check updates
			if (configRef.value.blockExtensionUpdates) {
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

		// Check if URL matches any allowed patterns (whitelist)
		const isAllowedURL = (url: string): boolean => {
			if (configRef.value.allowedDomains.length === 0) {
				return false;
			}

			for (const pattern of configRef.value.allowedDomains) {
				if (url.includes(pattern)) {
					return true;
				}
			}

			return false;
		};

		// Check if IPC channel is allowed
		const isIPCAllowed = (channel: string): boolean => {
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

			// Allow internal VS