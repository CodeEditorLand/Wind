/**
 * @module Effect
 * @description
 * Atomic Effect-TS services for Wind.
 * This module exports all Effect services and composed layer stacks.
 * All services now use atomic file structure for better organization and maintainability.
 */

// ============================================================================
// INDIVIDUAL SERVICES
// ============================================================================

// IPC (Inter-Process Communication)
export { IPCTag as IPC, IPCTauriLive, IPCElectronLive, IPCMockLive } from "./IPC.js";
export type { IPCService } from "./IPC.js";

// Sandbox (Preload globals)
export { Sandbox, SandboxLive, SandboxMockLive } from "./Sandbox/index.js";
export type { SandboxService } from "./Sandbox/index.js";

// Configuration
export {
	Configuration,
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "./Configuration.js";
export type { ConfigurationService } from "./Configuration.js";

// Telemetry (Logging, Spans, Metrics)
export {
	Telemetry,
	TelemetryLive,
	TelemetryMockLive,
	withSpan,
	withMetric,
} from "./Telemetry/index.js";
export type { TelemetryService } from "./Telemetry/index.js";

// Mountain (Backend connection & RPC)
export { Mountain, MountainLive, MountainMockLive } from "./Mountain/index.js";
export type {
	MountainService,
	MountainConnectionState,
	SyncResource,
} from "./Mountain/index.js";

// MountainSync (Background synchronization)
export { MountainSyncTag, MountainSyncLive, MountainSyncMock } from "./MountainSync/index.js";
export type { MountainSyncService, SyncConfig, SyncStats, MountainSyncResult, SyncStatus } from "./MountainSync/index.js";

// Environment (System detection)
export { EnvironmentTag } from "./Environment/index.js";
export { EnvironmentLive } from "./Environment/index.js";
export { EnvironmentMock } from "./Environment/index.js";
export type { EnvironmentService, EnvironmentInfo, Platform, Architecture } from "./Environment/index.js";

// Health (Service health checks)
export { HealthTag, HealthLive, HealthMock } from "./Health/index.js";
export type { HealthService, ServiceHealth, SystemHealth, HealthStatus } from "./Health/index.js";

// Bootstrap (Orchestration of all stages)
export { BootstrapTag, BootstrapLive, BootstrapMock, runBootstrap } from "./Bootstrap/index.js";
export type { BootstrapService, BootstrapOptions, StageResult, BootstrapResult } from "./Bootstrap/index.js";

// Clipboard (System clipboard access)
export { ClipboardServiceTag, LiveClipboardServiceLayer, MockClipboardServiceLayer } from "./Clipboard.js";
export type { ClipboardService, ClipboardProblem } from "./Clipboard.js";

// ActivityBar (VSCode activity bar management)
export { ActivityBar, ActivityBarLive, ActivityBarMockLive } from "./ActivityBar/index.js";
export type { ActivityBarService, ActivityBarItem, CreateActivityBarItem, ActivityBarBadge } from "./ActivityBar/index.js";

// Panel (VSCode bottom panel management)
export { Panel, PanelLive, PanelMockLive } from "./Panel/index.js";
export type { PanelService, PanelView, CreatePanelView, PanelViewType } from "./Panel/index.js";

// Sidebar (VSCode sidebar management)
export { Sidebar, SidebarLive, SidebarMockLive } from "./Sidebar/index.js";
export type { SidebarService, SidebarPanel, CreateSidebarPanel } from "./Sidebar/index.js";

// StatusBar (VSCode status bar management)
export { StatusBar, StatusBarLive, StatusBarMockLive } from "./StatusBar/index.js";
export type { StatusBarService, StatusBarItem, CreateStatusBarItem } from "./StatusBar/index.js";

// ============================================================================
// LAYERS (For runtime composition)
// ============================================================================

export { TauriBaseLayer, TauriLiveLayer, TauriDevLayer } from "./Layers/Tauri.js";

// ============================================================================
// ERROR TYPES
// ============================================================================

// IPC errors
export { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "./IPC.js";

// Configuration errors
export {
	ConfigFetchError,
	ConfigValidationError,
	ConfigApplyError,
} from "./Configuration.js";

// Telemetry errors
export { TelemetryCollectionError } from "./Telemetry/index.js";

// Mountain errors
export {
	MountainConnectionError,
	MountainRPCError,
	MountainSyncError,
	MountainStateError,
} from "./Mountain/index.js";

// ActivityBar errors
export { ActivityBarItemNotFoundError, ActivityBarUpdateError } from "./ActivityBar/index.js";

// Panel errors
export { PanelViewNotFoundError, PanelUpdateError } from "./Panel/index.js";

// Sidebar errors
export { SidebarPanelNotFoundError, SidebarUpdateError } from "./Sidebar/index.js";

// StatusBar errors
export { StatusBarItemNotFoundError, StatusBarUpdateError } from "./StatusBar/index.js";
