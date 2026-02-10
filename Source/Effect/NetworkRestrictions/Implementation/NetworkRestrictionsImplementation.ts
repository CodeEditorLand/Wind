/**
 * @module Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation
 * @description
 * Main implementation of the NetworkRestrictions service. Provides a live layer
 * that blocks all external network traffic from VSCode workbench and extensions.
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Tag/NetworkRestrictionsTag} Service tag
 * @category Implementation
 * @example
 * ```typescript
 * import { NetworkRestrictionsLive } from "./Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
 * import { Effect } from "effect";
 * 
 * const program = Effect.gen(function* () {
 *   const restrictions = yield* NetworkRestrictions;
 *   const isAllowed = yield* restrictions.checkURL("https://api.example.com");
 *   console.log("Is allowed:", isAllowed);
 * });
 * 
 * Effect.runPromise(program.pipe(Effect.provide(NetworkRestrictionsLive)));
 * ```
 */

import { Effect, Layer, Ref } from "effect";
import { Telemetry } from "../../Telemetry.js";
import { NetworkRestrictions } from "../Tag/NetworkRestrictionsTag.js";
import type { NetworkRestrictionsService, BlockedRequest, TelemetryLevel } from "../Interface/NetworkRestrictionsService.js";
import type { NetworkRestrictionConfig } from "../Type/NetworkRestrictionConfig.js";
import createNetworkBlockError from "../Error/NetworkBlockError.js";
import createIPCBlockError from "../Error/IPCBlockError.js";
import {
	DEFAULT_NETWORK_RESTRICTIONS,
} from "../Constant/NetworkRestrictionsConstant.js";
import {
	isInternalURL,
	isBlockedURL,
	isAllowedURL,
	isIPCAllowed,
} from "./NetworkRestrictionsHelper.js";

// ============================================================================
// Implementation
// ============================================================================

/**
 * Live layer for NetworkRestrictions service
 * Provides a complete implementation that blocks external network traffic
 */
export const NetworkRestrictionsLive = Layer.effect(
	NetworkRestrictions,
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// Current configuration as ref
		const configRef = yield* Ref.make<NetworkRestrictionConfig>(
			JSON.parse(JSON.stringify(DEFAULT_NETWORK_RESTRICTIONS)),
		);

		// Blocked requests log (for internal debugging only)
		const blockedRequestsRef = yield* Ref.make<ReadonlyArray<BlockedRequest>>([]);

		// Telemetry level ref
		const telemetryLevelRef = yield* Ref.make<TelemetryLevel>("NONE");

		// Atom: Check if URL is allowed
		const checkURL: NetworkRestrictionsService["checkURL"] = (url: string) =>
			Effect.gen(function* () {
				const currentConfig = yield* configRef.get;

				// Check if internal URL
				if (currentConfig.allowInternal && isInternalURL(currentConfig, url)) {
					return true;
				}

				// Check if in whitelist
				if (isAllowedURL(currentConfig, url)) {
					return true;
				}

				// Check if blocked
				if (isBlockedURL(currentConfig, url)) {
					return yield* Effect.fail(createNetworkBlockError(url, "URL is blocked by network restrictions"));
				}

				// Default to block for safety
				if (currentConfig.blockHTTP || currentConfig.blockHTTPS) {
					const urlObj = new URL(url);
					if (urlObj.protocol === 'http:' && currentConfig.blockHTTP) {
						return yield* Effect.fail(createNetworkBlockError(url, "HTTP requests are blocked"));
					}
					if (urlObj.protocol === 'https:' && currentConfig.blockHTTPS) {
						return yield* Effect.fail(createNetworkBlockError(url, "HTTPS requests are blocked"));
					}
				}

				return false;
			});

		// Atom: Block a URL
		const blockURL: NetworkRestrictionsService["blockURL"] = (url: string, reason: string) =>
			Effect.gen(function* () {
				const currentConfig = yield* configRef.get;
				
				if (currentConfig.logBlocked) {
					yield* telemetry.log("warn", `[NetworkRestrictions] Blocked URL: ${url} - ${reason}`);
					
					// Add to blocked requests log
					yield* Ref.update(blockedRequestsRef, (logs) => [
						...logs,
						{
							timestamp: Date.now(),
							type: url.startsWith('https:') ? 'https' : 'http',
							target: url,
							reason,
						} satisfies BlockedRequest,
					]);
				}
			});

		// Atom: Check if IPC channel is allowed
		const checkIPCChannel: NetworkRestrictionsService["checkIPCChannel"] = (channel: string) =>
			Effect.gen(function* () {
				if (!isIPCAllowed(channel)) {
					return yield* Effect.fail(createIPCBlockError(
						channel,
						"IPC channel is blocked by network restrictions"
					));
				}
				return true;
			});

		// Atom: Get current configuration
		const config: NetworkRestrictionsService["config"] = configRef.get;

		// Atom: Update configuration
		const updateConfig: NetworkRestrictionsService["updateConfig"] = (updates: Partial<NetworkRestrictionConfig>) =>
			Effect.gen(function* () {
				const current = yield* configRef.get;
				yield* Ref.set(configRef, { ...current, ...updates } as NetworkRestrictionConfig);
				yield* telemetry.log("info", `[NetworkRestrictions] Configuration updated`);
			});

		// Atom: Get blocked requests log
		const getBlockedRequests: NetworkRestrictionsService["getBlockedRequests"] = blockedRequestsRef.get;

		// Atom: Clear blocked requests log
		const clearBlockedRequests: NetworkRestrictionsService["clearBlockedRequests"] = Ref.set(blockedRequestsRef, []);

		// Atom: Set telemetry level
		const setTelemetryLevel: NetworkRestrictionsService["setTelemetryLevel"] = (level: TelemetryLevel) =>
			Effect.gen(function* () {
				yield* Ref.set(telemetryLevelRef, level);
				yield* telemetry.log("info", `[NetworkRestrictions] Telemetry level set to: ${level}`);
			});

		// Atom: Get telemetry level
		const getTelemetryLevel: NetworkRestrictionsService["getTelemetryLevel"] = telemetryLevelRef.get;

		yield* telemetry.log("info", "[NetworkRestrictions] Network restrictions service initialized");

		const service: NetworkRestrictionsService = {
			checkURL,
			blockURL,
			checkIPCChannel,
			config,
			updateConfig,
			getBlockedRequests,
			clearBlockedRequests,
			setTelemetryLevel,
			getTelemetryLevel,
		};

		return service;
	}),
);

export default NetworkRestrictionsLive;
