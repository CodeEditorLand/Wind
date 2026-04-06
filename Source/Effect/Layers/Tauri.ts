/**
 * @module Effect/Layers/Tauri
 * @description
 * Complete Effect layer stack for Tauri runtime.
 * Composes all atomic services into a runnable layer.
 */

import { Layer } from "effect";

import { ActivityBarLive } from "../ActivityBar.js";
import { BootstrapLive } from "../Bootstrap.js";
import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { LiveCommandsServiceLayer as CommandsLive } from "../Commands/Commands.js";
import {
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "../Configuration.js";
import { LiveDecorationsServiceLayer as DecorationsLive } from "../Decorations/Decorations.js";
import { LiveEditorServiceLayer as EditorLive } from "../Editor/Editor.js";
import { EnvironmentLive } from "../Environment.js";
import { LiveExtensionsServiceLayer as ExtensionsLive } from "../Extensions/Extensions.js";
import { LiveFilesServiceLayer as FilesLive } from "../Files/Files.js";
import { HealthLive } from "../Health.js";
import { LiveHistoryServiceLayer as HistoryLive } from "../History/History.js";
import { LiveKeybindingServiceLayer as KeybindingLive } from "../Keybinding/Keybinding.js";
import { LiveLabelServiceLayer as LabelLive } from "../Label/Label.js";
import { LiveLanguageServiceLayer as LanguageLive } from "../Language/Language.js";
import { LiveLifecycleServiceLayer as LifecycleLive } from "../Lifecycle/Lifecycle.js";
import { LiveModelServiceLayer as ModelLive } from "../Model/Model.js";
import { LiveTextModelResolverServiceLayer as TextModelResolverLive } from "../TextModelResolver/TextModelResolver.js";
import { MountainLive } from "../Mountain.js";
import { MountainSyncLive } from "../MountainSync.js";
import { LiveNotificationServiceLayer as NotificationLive } from "../Notification/Notification.js";
import { LiveOutputServiceLayer as OutputLive } from "../Output/Output.js";
import { PanelLive } from "../Panel.js";
import { LiveProgressServiceLayer as ProgressLive } from "../Progress/Progress.js";
import { LiveQuickInputServiceLayer as QuickInputLive } from "../QuickInput/QuickInput.js";
import { SandboxLive } from "../Sandbox.js";
import { LiveSearchServiceLayer as SearchLive } from "../Search/Search.js";
import { SidebarLive } from "../Sidebar.js";
import { StatusBarLive } from "../StatusBar.js";
import { LiveStorageServiceLayer as StorageLive } from "../Storage/Storage.js";
import { TelemetryLive } from "../Telemetry.js";
import { LiveTerminalServiceLayer as TerminalLive } from "../Terminal/Terminal.js";
import { default as LiveTextFileServiceLayer } from "../TextFile/Live.js";
import { LiveThemesServiceLayer as ThemesLive } from "../Themes/Themes.js";
import { LiveWorkingCopyServiceLayer as WorkingCopyLive } from "../WorkingCopy/WorkingCopy.js";
import { LiveWorkspacesServiceLayer as WorkspacesLive } from "../Workspaces/Workspaces.js";

// ============================================================================
// Base Tauri Layer (without config sync)
// ============================================================================

/**
 * Base Tauri layer stack.
 * Provides: Sandbox + IPC + Configuration + Telemetry + Mountain + UI Services
 *
 * Use this when you need manual control over configuration sync.
 */
export const TauriBaseLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(EnvironmentLive))
	.pipe(Layer.provideMerge(ClipboardLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationLive))
	.pipe(Layer.provideMerge(MountainLive))
	.pipe(Layer.provideMerge(MountainSyncLive))
	.pipe(Layer.provideMerge(HealthLive))
	.pipe(Layer.provideMerge(BootstrapLive))
	.pipe(Layer.provideMerge(ActivityBarLive))
	.pipe(Layer.provideMerge(PanelLive))
	.pipe(Layer.provideMerge(SidebarLive))
	.pipe(Layer.provideMerge(StatusBarLive))
	// Editor service layers (depend on CommandsLive / IPC)
	.pipe(Layer.provideMerge(CommandsLive))
	.pipe(Layer.provideMerge(FilesLive))
	.pipe(Layer.provideMerge(LanguageLive))
	.pipe(Layer.provideMerge(ExtensionsLive))
	.pipe(Layer.provideMerge(EditorLive))
	// Tier 2 service layers
	.pipe(Layer.provideMerge(TerminalLive))
	.pipe(Layer.provideMerge(OutputLive))
	.pipe(Layer.provideMerge(LiveTextFileServiceLayer))
	// Tier 3 service layers
	.pipe(Layer.provideMerge(StorageLive))
	.pipe(Layer.provideMerge(NotificationLive))
	.pipe(Layer.provideMerge(ProgressLive))
	.pipe(Layer.provideMerge(QuickInputLive))
	.pipe(Layer.provideMerge(WorkspacesLive))
	.pipe(Layer.provideMerge(ThemesLive))
	.pipe(Layer.provideMerge(SearchLive))
	// P1 service layers
	.pipe(Layer.provideMerge(DecorationsLive))
	.pipe(Layer.provideMerge(WorkingCopyLive))
	.pipe(Layer.provideMerge(KeybindingLive))
	.pipe(Layer.provideMerge(LifecycleLive))
	// P2 service layers
	.pipe(Layer.provideMerge(HistoryLive))
	.pipe(Layer.provideMerge(LabelLive))
	.pipe(Layer.provideMerge(ModelLive))
	.pipe(Layer.provideMerge(TextModelResolverLive));

// ============================================================================
// Full Tauri Layer (with auto config sync)
// ============================================================================

/**
 * Full Tauri layer stack with automatic configuration sync.
 * Provides: All base services + reactive Mountain-driven config updates + UI Services
 *
 * This is the standard layer for Wind production builds.
 */
export const TauriLiveLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(EnvironmentLive))
	.pipe(Layer.provideMerge(ClipboardLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationWithSyncLive))
	.pipe(Layer.provideMerge(MountainLive))
	.pipe(Layer.provideMerge(MountainSyncLive))
	.pipe(Layer.provideMerge(HealthLive))
	.pipe(Layer.provideMerge(BootstrapLive))
	.pipe(Layer.provideMerge(ActivityBarLive))
	.pipe(Layer.provideMerge(PanelLive))
	.pipe(Layer.provideMerge(SidebarLive))
	.pipe(Layer.provideMerge(StatusBarLive))
	// Editor service layers (depend on CommandsLive / IPC)
	.pipe(Layer.provideMerge(CommandsLive))
	.pipe(Layer.provideMerge(FilesLive))
	.pipe(Layer.provideMerge(LanguageLive))
	.pipe(Layer.provideMerge(ExtensionsLive))
	.pipe(Layer.provideMerge(EditorLive))
	// Tier 2 service layers
	.pipe(Layer.provideMerge(TerminalLive))
	.pipe(Layer.provideMerge(OutputLive))
	.pipe(Layer.provideMerge(LiveTextFileServiceLayer))
	// Tier 3 service layers
	.pipe(Layer.provideMerge(StorageLive))
	.pipe(Layer.provideMerge(NotificationLive))
	.pipe(Layer.provideMerge(ProgressLive))
	.pipe(Layer.provideMerge(QuickInputLive))
	.pipe(Layer.provideMerge(WorkspacesLive))
	.pipe(Layer.provideMerge(ThemesLive))
	.pipe(Layer.provideMerge(SearchLive))
	// P1 service layers
	.pipe(Layer.provideMerge(DecorationsLive))
	.pipe(Layer.provideMerge(WorkingCopyLive))
	.pipe(Layer.provideMerge(KeybindingLive))
	.pipe(Layer.provideMerge(LifecycleLive))
	// P2 service layers
	.pipe(Layer.provideMerge(HistoryLive))
	.pipe(Layer.provideMerge(LabelLive))
	.pipe(Layer.provideMerge(ModelLive))
	.pipe(Layer.provideMerge(TextModelResolverLive));

// ============================================================================
// Tauri Development Layer (with verbose logging)
// ============================================================================

/**
 * Tauri layer with maximum telemetry and logging.
 * Useful for debugging and development.
 */
export const TauriDevLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(EnvironmentLive))
	.pipe(Layer.provideMerge(ClipboardLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationWithSyncLive))
	.pipe(Layer.provideMerge(MountainLive))
	.pipe(Layer.provideMerge(MountainSyncLive))
	.pipe(Layer.provideMerge(HealthLive))
	.pipe(Layer.provideMerge(BootstrapLive))
	.pipe(Layer.provideMerge(ActivityBarLive))
	.pipe(Layer.provideMerge(PanelLive))
	.pipe(Layer.provideMerge(SidebarLive))
	.pipe(Layer.provideMerge(StatusBarLive));

// Export default for convenience
export default TauriLiveLayer;
