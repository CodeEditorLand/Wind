/**
 * @module Effect
 * @description
 * Atomic Effect-TS services for Wind.
 * This module exports all Effect services and composed layer stacks.
 */

// ============================================================================
// INDIVIDUAL SERVICES
// ============================================================================

// IPC (Inter-Process Communication)
export { IPC, IPCTauriLive, IPCElectronLive, IPCMockLive } from "./IPC.js";
export type { IPCService } from "./IPC.js";

// Sandbox (Preload globals)
export { Sandbox, SandboxLive, SandboxMockLive } from "./Sandbox.js";
export type { SandboxService } from "./Sandbox.js";

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
} from "./Telemetry.js";
export type { TelemetryService } from "./Telemetry.js";

// Mountain (Backend connection & RPC)
export { Mountain, MountainLive, MountainMockLive } from "./Mountain.js";
export type {
	MountainService,
	MountainConnectionState,
	SyncResource,
} from "./Mountain.js";

// MountainSync (Background synchronization)
export { MountainSyncTag, MountainSyncLive, MountainSyncMock } from "./MountainSync.js";
export type { MountainSyncService, SyncConfig, SyncStats, MountainSyncResult, SyncStatus } from "./MountainSync.js";

// Environment (System detection)
export { EnvironmentTag, EnvironmentLive, EnvironmentMock } from "./Environment.js";
export type { EnvironmentService, EnvironmentInfo, Platform, Architecture } from "./Environment.js";

// Health (Service health checks)
export { HealthTag, HealthLive, HealthMock } from "./Health.js";
export type { HealthService, ServiceHealth, SystemHealth, HealthStatus } from "./Health.js";

// Bootstrap (Orchestration of all stages)
export { BootstrapTag, BootstrapLive, BootstrapMock, runBootstrap } from "./Bootstrap.js";
export type { BootstrapService, BootstrapOptions, StageResult, BootstrapResult } from "./Bootstrap.js";

// Clipboard (System clipboard access)
export { ClipboardServiceTag, LiveClipboardServiceLayer, MockClipboardServiceLayer } from "./Clipboard.js";
export type { ClipboardService, ClipboardProblem } from "./Clipboard.js";

// ActivityBar (VSCode activity bar management)
export { ActivityBar, ActivityBarLive, ActivityBarMockLive } from "./ActivityBar.js";
export type { ActivityBarService, ActivityBarItem, CreateActivityBarItem, ActivityBarBadge } from "./ActivityBar.js";

// Panel (VSCode bottom panel management)
export { Panel, PanelLive, PanelMockLive } from "./Panel.js";
export type { PanelService, PanelView, CreatePanelView, PanelViewType } from "./Panel.js";

// Sidebar (VSCode sidebar management)
export { Sidebar, SidebarLive, SidebarMockLive } from "./Sidebar.js";
export type { SidebarService, SidebarPanel, CreateSidebarPanel } from "./Sidebar.js";

// StatusBar (VSCode status bar management)
export { StatusBar, StatusBarLive, StatusBarMockLive } from "./StatusBar.js";
export type { StatusBarService, StatusBarItem, CreateStatusBarItem } from "./StatusBar.js";

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
export { TelemetryCollectionError } from "./Telemetry.js";

// Mountain errors
export {
	MountainConnectionError,
	MountainRPCError,
	MountainSyncError,
	MountainStateError,
} from "./Mountain.js";

// ActivityBar errors
export { ActivityBarItemNotFoundError, ActivityBarUpdateError } from "./ActivityBar.js";

// Panel errors
export { PanelViewNotFoundError, PanelUpdateError } from "./Panel.js";

// Sidebar errors
export { SidebarPanelNotFoundError, SidebarUpdateError } from "./Sidebar.js";

// StatusBar errors
export { StatusBarItemNotFoundError, StatusBarUpdateError } from "./StatusBar.js";
