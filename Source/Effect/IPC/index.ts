/**
 * @module Effect/IPC
 * @description
 * Plain IPC service wrapping Tauri IPC with typed methods.
 *
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Errors
export {
	IPCInvokeError,
	IPCSendError,
	IPCSubscriptionError,
} from "./Error/IPCError.js";

// Interface
export type {
	IPCService,
	IPCEvent,
	IPCEventListener,
	IPCEventStream,
	IPCCleanup,
} from "./Interface/IPCService.js";

// Implementations
export { TauriIPCLive } from "./Implementation/TauriIPC.js";

export { MockIPCLive } from "./Mock.js";
