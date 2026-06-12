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

export type {
	ProviderRegistrationResult,
	WorkbenchDiagnostics,
	WorkbenchInitState,
	WorkbenchIntegrationConfig,
	WorkbenchIntegrationService,
	WorkbenchState,
	WorkspaceContext,
} from "../Workbench/index.js";
// Workbench (VSCode browser workbench integration)
export {
	WorkbenchIntegration as Workbench,
	WorkbenchIntegrationErrorCode,
} from "../Workbench/index.js";

export type {
	BootstrapLogger,
	BootstrapOptions,
	BootstrapResult,
	BootstrapService,
	StageResult,
} from "./Bootstrap/index.js";
// Bootstrap (Orchestration of all stages)
export {
	BootstrapLive,
	BootstrapMock,
	runBootstrap,
} from "./Bootstrap/index.js";
export type { ClipboardProblem, ClipboardService } from "./Clipboard.js";
// Clipboard (System clipboard access)
export {
	ClipboardServiceTag,
	LiveClipboardServiceLayer,
	MockClipboardServiceLayer,
} from "./Clipboard.js";
export type { Configuration, ConfigurationService } from "./Configuration.js";
// Configuration
export {
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "./Configuration.js";
export type {
	Architecture,
	EnvironmentInfo,
	EnvironmentService,
	Platform,
} from "./Environment/index.js";
// Environment (System detection)
export {
	LiveEnvironmentService as EnvironmentLive,
	MockEnvironmentService as EnvironmentMock,
	makeMockEnvironment,
} from "./Environment/index.js";
export type {
	HealthMonitorHandle,
	HealthService,
	HealthStatus,
	ServiceHealth,
	SystemHealth,
} from "./Health/index.js";

// Health (Service health checks)
export { HealthLive, HealthMock } from "./Health/index.js";
export type {
	IPCCleanup,
	IPCEvent,
	IPCEventListener,
	IPCEventStream,
	IPCService,
} from "./IPC.js";
// IPC (Inter-Process Communication)
export {
	TauriIPCLive as IPCLive,
	MockIPCLive as IPCMockLive,
} from "./IPC.js";
export type {
	Mountain,
	MountainConnectionState,
	MountainService,
	SyncResource,
} from "./Mountain/index.js";
// Mountain (Backend connection & RPC)
export { MountainLive, MountainMockLive } from "./Mountain/index.js";
export type {
	MountainSyncResult,
	MountainSyncService,
	SyncConfig,
	SyncStats,
	SyncStatus,
} from "./MountainSync/index.js";
// MountainSync (Background synchronization)
export {
	MountainSyncLive,
	MountainSyncMock,
	MountainSyncTag,
} from "./MountainSync/index.js";
export type {
	CreatePanelView,
	PanelService,
	PanelView,
	PanelViewType,
} from "./Panel/index.js";

// Panel (VSCode bottom panel management)
export { LivePanelService as PanelLive, PanelMockLive, makeMockPanel } from "./Panel/index.js";
export type { SandboxService } from "./Sandbox/index.js";
// Sandbox (Preload globals)
export { Sandbox, SandboxLive, SandboxMockLive } from "./Sandbox/index.js";

export type {
	CreateSidebarPanel,
	SidebarPanel,
	SidebarService,
} from "./Sidebar/index.js";
// Sidebar (VSCode sidebar management)
export { Sidebar, SidebarLive, SidebarMockLive } from "./Sidebar/index.js";

export type {
	CreateStatusBarItem,
	StatusBarItem,
	StatusBarService,
} from "./StatusBar/index.js";
// StatusBar (VSCode status bar management)
export {
	LiveStatusBarService as StatusBarLive,
	StatusBarMockLive,
	makeMockStatusBar,
} from "./StatusBar/index.js";
export type { TelemetryService } from "./Telemetry/index.js";
// Telemetry (Logging, Spans, Metrics)
export {
	Telemetry,
	TelemetryLive,
	TelemetryMockLive,
	withMetric,
	withSpan,
} from "./Telemetry/index.js";

// ============================================================================
// LAYERS (For runtime composition)
// ============================================================================

export {
	TauriBaseLayer,
	TauriDevLayer,
	TauriLiveLayer,
} from "./Layers/Tauri.js";

// ============================================================================
// ERROR TYPES
// ============================================================================

export type { FileSystemProviderService } from "../FileSystem/index.js";
// FileSystem (VSCode-like file system access)
export { FileSystemProvider } from "../FileSystem/index.js";

// Configuration errors
export {
	ConfigApplyError,
	ConfigFetchError,
	ConfigValidationError,
} from "./Configuration.js";
// IPC errors
export { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "./IPC.js";
// Mountain errors
export {
	MountainConnectionError,
	MountainRPCError,
	MountainStateError,
	MountainSyncError,
} from "./Mountain/index.js";
// Panel errors
export { PanelUpdateError, PanelViewNotFoundError } from "./Panel/index.js";
// Sidebar errors
export {
	SidebarPanelNotFoundError,
	SidebarUpdateError,
} from "./Sidebar/index.js";
// StatusBar errors
export {
	StatusBarItemNotFoundError,
	StatusBarUpdateError,
} from "./StatusBar/index.js";
// Telemetry errors
export { TelemetryCollectionError } from "./Telemetry/index.js";

// ============================================================================
// ATOMIC SERVICE BARRELS
// ============================================================================
// Each barrel re-exports the full public surface of its atomic service
// directory. Consumers should prefer importing directly from the named
// barrel (e.g. `./Commands.js`) over reaching into `./Commands/Live.js`.
// Using `export *` avoids duplicating the individual symbol lists that
// would otherwise drift as each service evolves.

export * from "./Commands.js";

export * from "./Decorations.js";

export * from "./Editor.js";

export * from "./Extensions.js";

export * from "./Files.js";

export * from "./History.js";

export * from "./Keybinding.js";

export * from "./Label.js";

export * from "./Language.js";

export * from "./Lifecycle.js";

export * from "./Model.js";

export * from "./Notification.js";

export * from "./Output.js";

export * from "./Progress.js";

export * from "./QuickInput.js";

export * from "./Search.js";

export * from "./Storage.js";

export * from "./Terminal.js";

export * from "./TextFile.js";

export * from "./TextModelResolver.js";

export * from "./Themes.js";

export * from "./WorkingCopy.js";

export * from "./Workspaces.js";
