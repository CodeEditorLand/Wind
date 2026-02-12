/**
 * @module Effect/NetworkRestrictions
 * @description
 * Atomic Network Restrictions service using Effect-TS.
 * Blocks all external network traffic from VSCode workbench and extensions.
 * 
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Live implementation
 * @see {@link Effect/NetworkRestrictions/Tag/NetworkRestrictionsTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import { NetworkRestrictionsLive, NetworkRestrictions } from "./Effect/NetworkRestrictions.js";
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

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Error types
export { default as CreateNetworkBlockError } from "./NetworkRestrictions/Error/NetworkBlockError.js";
export type { NetworkBlockError } from "./NetworkRestrictions/Error/NetworkBlockError.js";
export { default as CreateIPCBlockError } from "./NetworkRestrictions/Error/IPCBlockError.js";
export type { IPCBlockError } from "./NetworkRestrictions/Error/IPCBlockError.js";

// Types
export type { NetworkRestrictionConfig } from "./NetworkRestrictions/Type/NetworkRestrictionConfig.js";

// Constants
export {
	DEFAULT_NETWORK_RESTRICTIONS,
	TelemetryEndpoint,
	MarketplaceEndpoint,
	UpdateEndpoint,
	AiEndpoint,
	ALLOWED_IPC_CHANNELS,
	BLOCKED_IPC_CHANNELS,
} from "./NetworkRestrictions/Constant/NetworkRestrictionsConstant.js";

// Interface
export type { NetworkRestrictionsService, BlockedRequest, TelemetryLevel } from "./NetworkRestrictions/Interface/NetworkRestrictionsService.js";

// Tag
export { NetworkRestrictions, NetworkRestrictionsTag } from "./NetworkRestrictions/Tag/NetworkRestrictionsTag.js";

// Implementation
export {
	IsInternalURL,
	IsBlockedURL,
	IsAllowedURL,
	IsIPCAllowed,
} from "./NetworkRestrictions/Implementation/NetworkRestrictionsHelper.js";

export { NetworkRestrictionsLive as default } from "./NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
