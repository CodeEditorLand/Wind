/**
 * @module Effect/IPC
 * @description
 * Plain IPC service for inter-process communication.
 * Provides Tauri IPC access with typed methods — no Effect wrappers.
 *
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Error classes
export {
	IPCInvokeError,
	IPCSendError,
	IPCSubscriptionError,
} from "./IPC/index.js";

// Service interface
export type {
	IPCService,
	IPCEvent,
	IPCEventListener,
	IPCEventStream,
	IPCCleanup,
} from "./IPC/index.js";

// Implementations
export { TauriIPCLive, MockIPCLive } from "./IPC/index.js";

// Backward compatibility aliases
export { TauriIPCLive as IPCTauriLive } from "./IPC/index.js";

export { MockIPCLive as IPCMockLive } from "./IPC/index.js";
