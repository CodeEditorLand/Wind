/**
 * @module Effect/NetworkRestrictions/Interface/NetworkRestrictionsService
 * @description
 * Service interface for the NetworkRestrictions service. Provides methods for checking
 * and blocking network requests and IPC channels.
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Implementation
 * @see {@link Effect/NetworkRestrictions/Error/NetworkBlockError} Related error type
 * @category Interface
 */

import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Blocked request entry for logging
 */
export interface BlockedRequest {
	readonly timestamp: number;

	readonly type: "http" | "https" | "websocket" | "ipc";

	readonly target: string;

	readonly reason: string;
}

/**
 * Telemetry levels
 */
export type TelemetryLevel = "NONE" | "CRASH" | "ERROR" | "USAGE";

/**
 * Network Restrictions service interface.
 *
 * `checkURL` throws {@link Effect/NetworkRestrictions/Error/NetworkBlockError}
 * and `checkIPCChannel` throws
 * {@link Effect/NetworkRestrictions/Error/IPCBlockError} when the target is
 * blocked.
 */
export interface NetworkRestrictionsService {
	/** Check if a URL is allowed */
	readonly checkURL: (url: string) => boolean;

	/** Block a URL (used by window.fetch override) */
	readonly blockURL: (url: string, reason: string) => void;

	/** Check if an IPC channel is allowed */
	readonly checkIPCChannel: (channel: string) => boolean;

	/** Get current configuration */
	readonly config: () => NetworkRestrictionConfig;

	/** Update configuration */
	readonly updateConfig: (config: Partial<NetworkRestrictionConfig>) => void;

	/** Get list of blocked requests (for debugging) */
	readonly getBlockedRequests: () => ReadonlyArray<BlockedRequest>;

	/** Clear blocked requests log */
	readonly clearBlockedRequests: () => void;

	/** Set telemetry level (NONE, CRASH, ERROR, USAGE) */
	readonly setTelemetryLevel: (level: TelemetryLevel) => void;

	/** Get current telemetry level */
	readonly getTelemetryLevel: () => TelemetryLevel;
}
