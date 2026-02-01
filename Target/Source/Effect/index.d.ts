/**
 * @module Effect
 * @description
 * Atomic Effect-TS services for Wind.
 * This module exports all Effect services and composed layer stacks.
 */
export { IPC, IPCTauriLive, IPCElectronLive, IPCMockLive } from "./IPC.js";
export type { IPCService } from "./IPC.js";
export { Sandbox, SandboxLive, SandboxMockLive } from "./Sandbox.js";
export type { SandboxService } from "./Sandbox.js";
export { Configuration, ConfigurationLive, ConfigurationWithSyncLive, ConfigurationMockLive, } from "./Configuration.js";
export type { ConfigurationService } from "./Configuration.js";
export { Telemetry, TelemetryLive, TelemetryMockLive, withSpan, withMetric, } from "./Telemetry.js";
export type { TelemetryService } from "./Telemetry.js";
export { Mountain, MountainLive, MountainMockLive } from "./Mountain.js";
export type { MountainService, MountainConnectionState, SyncResource, SyncResult, } from "./Mountain.js";
export { EnvironmentTag, EnvironmentLive, EnvironmentMock } from "./Environment.js";
export type { EnvironmentService, EnvironmentInfo, Platform, Architecture } from "./Environment.js";
export { HealthTag, HealthLive, HealthMock } from "./Health.js";
export type { HealthService, ServiceHealth, SystemHealth, HealthStatus } from "./Health.js";
export { BootstrapTag, BootstrapLive, BootstrapMock, runBootstrap } from "./Bootstrap.js";
export type { BootstrapService, BootstrapOptions, StageResult, BootstrapResult } from "./Bootstrap.js";
export { MountainSyncTag, MountainSyncLive, MountainSyncMock } from "./MountainSync.js";
export type { MountainSyncService, SyncConfig, SyncStats, SyncResult, SyncStatus } from "./MountainSync.js";
export { ClipboardServiceTag, LiveClipboardServiceLayer, MockClipboardServiceLayer } from "./Clipboard.js";
export type { ClipboardService, ClipboardProblem } from "./Clipboard.js";
export { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "./IPC.js";
export { ConfigFetchError, ConfigValidationError, ConfigApplyError, } from "./Configuration.js";
export { TelemetryCollectionError } from "./Telemetry.js";
export { MountainConnectionError, MountainRPCError, MountainSyncError, MountainStateError, } from "./Mountain.js";
//# sourceMappingURL=index.d.ts.map