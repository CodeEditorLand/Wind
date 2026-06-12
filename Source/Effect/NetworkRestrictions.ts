/**
 * @module Effect/NetworkRestrictions
 * @description
 * Atomic Network Restrictions service backed by plain in-memory state.
 * Blocks all external network traffic from VSCode workbench and extensions.
 *
 * @see {@link Effect/NetworkRestrictions/Interface/NetworkRestrictionsService} Service interface
 * @see {@link Effect/NetworkRestrictions/Implementation/NetworkRestrictionsImplementation} Live implementation
 * @category Service
 * @example
 * ```typescript
 * import NetworkRestrictionsLive from "./Effect/NetworkRestrictions.js";
 *
 * const IsAllowed = NetworkRestrictionsLive.checkURL("https://api.example.com");
 * ```
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Error types
export { default as CreateNetworkBlockError } from "./NetworkRestrictions/Error/NetworkBlockError.js";

export { NetworkBlockError } from "./NetworkRestrictions/Error/NetworkBlockError.js";

export { default as CreateIPCBlockError } from "./NetworkRestrictions/Error/IPCBlockError.js";

export { IPCBlockError } from "./NetworkRestrictions/Error/IPCBlockError.js";

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
export type {
	NetworkRestrictionsService,
	BlockedRequest,
	TelemetryLevel,
} from "./NetworkRestrictions/Interface/NetworkRestrictionsService.js";

// Implementation
export {
	IsInternalURL,
	IsBlockedURL,
	IsAllowedURL,
	IsIPCAllowed,
} from "./NetworkRestrictions/Implementation/NetworkRestrictionsHelper.js";

export { makeNetworkRestrictions } from "./NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";

export { NetworkRestrictionsLive as default } from "./NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
