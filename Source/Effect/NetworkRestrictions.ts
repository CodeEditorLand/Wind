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

// Constants
export {
	AiEndpoint,
	ALLOWED_IPC_CHANNELS,
	BLOCKED_IPC_CHANNELS,
	DEFAULT_NETWORK_RESTRICTIONS,
	MarketplaceEndpoint,
	TelemetryEndpoint,
	UpdateEndpoint,
} from "./NetworkRestrictions/Constant/NetworkRestrictionsConstant.js";
export {
	default as CreateIPCBlockError,
	IPCBlockError,
} from "./NetworkRestrictions/Error/IPCBlockError.js";
// Error types
export {
	default as CreateNetworkBlockError,
	NetworkBlockError,
} from "./NetworkRestrictions/Error/NetworkBlockError.js";
// Implementation
export {
	IsAllowedURL,
	IsBlockedURL,
	IsInternalURL,
	IsIPCAllowed,
} from "./NetworkRestrictions/Implementation/NetworkRestrictionsHelper.js";
export {
	makeNetworkRestrictions,
	NetworkRestrictionsLive as default,
} from "./NetworkRestrictions/Implementation/NetworkRestrictionsImplementation.js";
// Interface
export type {
	BlockedRequest,
	NetworkRestrictionsService,
	TelemetryLevel,
} from "./NetworkRestrictions/Interface/NetworkRestrictionsService.js";
// Types
export type { NetworkRestrictionConfig } from "./NetworkRestrictions/Type/NetworkRestrictionConfig.js";
