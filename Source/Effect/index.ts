/**
 * @module Effect
 * @description
 * Atomic Effect-TS services for Wind.
 * This module exports all Effect services and composed layer stacks.
 */

// Export individual services
export { IPC, IPCService, IPCTauriLive, IPCElectronLive, IPCMockLive } from "./IPC.js";
export { Sandbox, SandboxService, SandboxLive, SandboxMockLive } from "./Sandbox.js";
export { 
  Configuration, 
  ConfigurationService, 
  ConfigurationLive, 
  ConfigurationWithSyncLive,
  ConfigurationMockLive 
} from "./Configuration.js";
export { 
  Telemetry, 
  TelemetryService, 
  TelemetryLive, 
  TelemetryMockLive,
  withSpan,
  withMetric 
} from "./Telemetry.js";
export { 
  Mountain, 
  MountainService, 
  MountainLive, 
  MountainMockLive,
  MountainConnectionState,
  SyncResource,
  SyncResult
} from "./Mountain.js";

// Re-export error types
export {
  IPCInvokeError,
  IPCSendError,
  IPCSubscriptionError
} from "./IPC.js";

export {
  ConfigFetchError,
  ConfigValidationError,
  ConfigApplyError
} from "./Configuration.js";

export {
  TelemetryCollectionError
} from "./Telemetry.js";

export {
  MountainConnectionError,
  MountainRPCError,
  MountainSyncError,
  MountainStateError
} from "./Mountain.js";
