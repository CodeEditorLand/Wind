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

import { DEFAULT_NETWORK_RESTRICTIONS } from "../Constant/NetworkRestrictionsConstant.js";

import CreateIPCBlockError from "../Error/IPCBlockError.js";

import CreateNetworkBlockError from "../Error/NetworkBlockError.js";

import type {
	BlockedRequest,
	NetworkRestrictionsService,
	TelemetryLevel,
} from "../Interface/NetworkRestrictionsService.js";

import { NetworkRestrictions } from "../Tag/NetworkRestrictionsTag.js";

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

/**
 * Live layer for NetworkRestrictions service
 * Provides a complete implementation that blocks external network traffic
 */
export const NetworkRestrictionsLive = Layer.effect(
	NetworkRestrictions,

	Effect.gen(function* () {
		const TelemetryService = yield* Telemetry;

		// Current configuration as ref
		const ConfigRef = yield* Ref.make<NetworkRestrictionConfig>(
			JSON.parse(JSON.stringify(DEFAULT_NETWORK_RESTRICTIONS)),
		);

		// Blocked requests log (for internal debugging only)
		const BlockedRequestsRef = yield* Ref.make<
			ReadonlyArray<BlockedRequest>
		>([]);

		// Telemetry level ref
		const TelemetryLevelRef = yield* Ref.make<TelemetryLevel>("NONE");

		// Atom: Check if URL is allowed
		const CheckURL: NetworkRestrictionsService["checkURL"] = (
			Url: string,
		) =>
			Effect.gen(function* () {
				const CurrentConfig = yield* ConfigRef.get;

				// Check if internal URL
				if (
					CurrentConfig.allowInternal &&
					IsInternalURL(CurrentConfig, Url)
				) {
					return true;
				}

				// Check if in whitelist
				if (IsAllowedURL(CurrentConfig, Url)) {
					return true;
				}

				// Check if blocked
				if (IsBlockedURL(CurrentConfig, Url)) {
					return yield* Effect.fail(
						CreateNetworkBlockError(
							Url,

							"URL is blocked by network restrictions",
						),
					);
				}

				// Default to block for safety
				if (CurrentConfig.blockHTTP || CurrentConfig.blockHTTPS) {
					const UrlObj = new URL(Url);

					if (
						UrlObj.protocol === "http:" &&
						CurrentConfig.blockHTTP
					) {
						return yield* Effect.fail(
							CreateNetworkBlockError(
								Url,

								"HTTP requests are blocked",
							),
						);
					}

					if (
						UrlObj.protocol === "https:" &&
						CurrentConfig.blockHTTPS
					) {
						return yield* Effect.fail(
							CreateNetworkBlockError(
								Url,

								"HTTPS requests are blocked",
							),
						);
					}
				}

				return false;
			});

		// Atom: Block a URL
		const BlockURL: NetworkRestrictionsService["blockURL"] = (
			Url: string,

			Reason: string,
		) =>
			Effect.gen(function* () {
				const CurrentConfig = yield* ConfigRef.get;

				if (CurrentConfig.logBlocked) {
					yield* TelemetryService.log(
						"warn",

						`[NetworkRestrictions] Blocked URL: ${Url} - ${Reason}`,
					);

					// Add to blocked requests log
					yield* Ref.update(BlockedRequestsRef, (Logs) => [
						...Logs,

						{
							timestamp: Date.now(),
							type: Url.startsWith("https:") ? "https" : "http",
							target: Url,
							reason: Reason,
						} satisfies BlockedRequest,
					]);
				}
			});

		// Atom: Check if IPC channel is allowed
		const CheckIPCChannel: NetworkRestrictionsService["checkIPCChannel"] = (
			Channel: string,
		) =>
			Effect.gen(function* () {
				if (!IsIPCAllowed(Channel)) {
					return yield* Effect.fail(
						CreateIPCBlockError(
							Channel,

							"IPC channel is blocked by network restrictions",
						),
					);
				}

				return true;
			});

		// Atom: Get current configuration
		const Config: NetworkRestrictionsService["config"] = ConfigRef.get;

		// Atom: Update configuration
		const UpdateConfig: NetworkRestrictionsService["updateConfig"] = (
			Updates: Partial<NetworkRestrictionConfig>,
		) =>
			Effect.gen(function* () {
				const Current = yield* ConfigRef.get;

				yield* Ref.set(ConfigRef, {
					...Current,
					...Updates,
				} as NetworkRestrictionConfig);

				yield* TelemetryService.log(
					"info",

					`[NetworkRestrictions] Configuration updated`,
				);
			});

		// Atom: Get blocked requests log
		const GetBlockedRequests: NetworkRestrictionsService["getBlockedRequests"] =
			BlockedRequestsRef.get;

		// Atom: Clear blocked requests log
		const ClearBlockedRequests: NetworkRestrictionsService["clearBlockedRequests"] =
			Ref.set(BlockedRequestsRef, []);

		// Atom: Set telemetry level
		const SetTelemetryLevel: NetworkRestrictionsService["setTelemetryLevel"] =
			(Level: TelemetryLevel) =>
				Effect.gen(function* () {
					yield* Ref.set(TelemetryLevelRef, Level);

					yield* TelemetryService.log(
						"info",

						`[NetworkRestrictions] Telemetry level set to: ${Level}`,
					);
				});

		// Atom: Get telemetry level
		const GetTelemetryLevel: NetworkRestrictionsService["getTelemetryLevel"] =
			TelemetryLevelRef.get;

		yield* TelemetryService.log(
			"info",

			"[NetworkRestrictions] Network restrictions service initialized",
		);

		const service: NetworkRestrictionsService = {
			checkURL: CheckURL,
			blockURL: BlockURL,
			checkIPCChannel: CheckIPCChannel,
			config: Config,
			updateConfig: UpdateConfig,
			getBlockedRequests: GetBlockedRequests,
			clearBlockedRequests: ClearBlockedRequests,
			setTelemetryLevel: SetTelemetryLevel,
			getTelemetryLevel: GetTelemetryLevel,
		};

		return service;
	}),
);

export default NetworkRestrictionsLive;
