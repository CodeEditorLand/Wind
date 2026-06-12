/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation
 * @description
 * Main implementation of the NetworkRestrictions service. Plain in-memory
 * service that blocks all external network traffic from VSCode workbench
 * and extensions.
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @category Implementation
 * @example
 * ```typescript
 * import { NetworkRestrictionsLive } from "./Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
 *
 * const IsAllowed = NetworkRestrictionsLive.checkURL("https://api.example.com");
 * ```
 */

import { DEFAULT_NETWORK_RESTRICTIONS } from "../Constant/NetworkRestrictionsConstant.js";
import CreateIPCBlockError from "../Error/IPCBlockError.js";
import CreateNetworkBlockError from "../Error/NetworkBlockError.js";
import type {
	BlockedRequest,
	NetworkRestrictionsService,
	TelemetryLevel,
} from "../Interface/NetworkRestrictionsService.js";
import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";
import {
	IsAllowedURL,
	IsBlockedURL,
	IsInternalURL,
	IsIPCAllowed,
} from "./NetworkRestrictionsHelper.js";

// ============================================================================
// Implementation
// ============================================================================

type NetworkRestrictionsLogger = (
	level: "info" | "warn" | "error",

	message: string,
) => void;

// Mirrors the observable side effect of the Telemetry service's log method
// without pulling in its Effect-typed surface.
const DefaultLogger: NetworkRestrictionsLogger = (Level, Message) => {
	if (typeof performance !== "undefined") {
		try {
			performance.mark(`land:telemetry:${Level}:${Message.slice(0, 80)}`);
		} catch {}
	}
};

/**
 * Creates the NetworkRestrictions service.
 * Blocks external network traffic according to its configuration.
 */
export const makeNetworkRestrictions = (
	Log: NetworkRestrictionsLogger = DefaultLogger,
): NetworkRestrictionsService => {
	let _config: NetworkRestrictionConfig = JSON.parse(
		JSON.stringify(DEFAULT_NETWORK_RESTRICTIONS),
	) as NetworkRestrictionConfig;

	// Blocked requests log (for internal debugging only)
	let _blockedRequests: ReadonlyArray<BlockedRequest> = [];

	let _telemetryLevel: TelemetryLevel = "NONE";

	const checkURL = (Url: string): boolean => {
		// Check if internal URL
		if (_config.allowInternal && IsInternalURL(_config, Url)) {
			return true;
		}

		// Check if in whitelist
		if (IsAllowedURL(_config, Url)) {
			return true;
		}

		// Check if blocked
		if (IsBlockedURL(_config, Url)) {
			throw CreateNetworkBlockError(
				Url,

				"URL is blocked by network restrictions",
			);
		}

		// Default to block for safety
		if (_config.blockHTTP || _config.blockHTTPS) {
			const UrlObj = new URL(Url);

			if (UrlObj.protocol === "http:" && _config.blockHTTP) {
				throw CreateNetworkBlockError(Url, "HTTP requests are blocked");
			}

			if (UrlObj.protocol === "https:" && _config.blockHTTPS) {
				throw CreateNetworkBlockError(
					Url,

					"HTTPS requests are blocked",
				);
			}
		}

		return false;
	};

	const blockURL = (Url: string, Reason: string): void => {
		if (_config.logBlocked) {
			Log(
				"warn",

				`[NetworkRestrictions] Blocked URL: ${Url} - ${Reason}`,
			);

			// Add to blocked requests log
			_blockedRequests = [
				..._blockedRequests,

				{
					timestamp: Date.now(),
					type: Url.startsWith("https:") ? "https" : "http",
					target: Url,
					reason: Reason,
				} satisfies BlockedRequest,
			];
		}
	};

	const checkIPCChannel = (Channel: string): boolean => {
		if (!IsIPCAllowed(Channel)) {
			throw CreateIPCBlockError(
				Channel,

				"IPC channel is blocked by network restrictions",
			);
		}

		return true;
	};

	const updateConfig = (
		Updates: Partial<NetworkRestrictionConfig>,
	): void => {
		_config = { ..._config, ...Updates } as NetworkRestrictionConfig;

		Log("info", "[NetworkRestrictions] Configuration updated");
	};

	const setTelemetryLevel = (Level: TelemetryLevel): void => {
		_telemetryLevel = Level;

		Log("info", `[NetworkRestrictions] Telemetry level set to: ${Level}`);
	};

	Log(
		"info",

		"[NetworkRestrictions] Network restrictions service initialized",
	);

	return {
		checkURL,
		blockURL,
		checkIPCChannel,
		config: () => _config,
		updateConfig,
		getBlockedRequests: () => _blockedRequests,
		clearBlockedRequests: () => {
			_blockedRequests = [];
		},
		setTelemetryLevel,
		getTelemetryLevel: () => _telemetryLevel,
	} satisfies NetworkRestrictionsService;
};

/**
 * Live NetworkRestrictions service.
 * Blocks external network traffic by default.
 */
export const NetworkRestrictionsLive: NetworkRestrictionsService =
	makeNetworkRestrictions();

export default NetworkRestrictionsLive;
