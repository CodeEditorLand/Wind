/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 *
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Types
export type {
	IPCInvokeError,
	IPCSendError,
	IPCSubscriptionError,
} from "./Error/IPCError.js";

// Interface
export type { IPCService } from "./Interface/IPCService.js";

// Tag
export { IPCTag, IPC } from "./Tag/IPCTag.js";

// Implementations
export { TauriIPCLive } from "./Implementation/TauriIPC.js";

// Layers
export {
	IPCTauriLive as default,
	IPCTauriLive as IPCElectronLive,
} from "./Live.js";

export { MockIPCLive } from "./Mock.js";

// Error helpers
export {
	CreateIPCInvokeError,
	CreateIPCSendError,
	CreateIPCSubscriptionError,
} from "./Error/IPCError.js";
