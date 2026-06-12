/**
 * @module Effect/Layers/Tauri
 * @description
 * Complete Effect layer stack for Tauri runtime.
 * Composes all atomic services into a runnable layer.
 */

import { Layer } from "effect";

import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { LiveCommandsServiceLayer as CommandsLive } from "../Commands/Commands.js";
import { LiveDecorationsServiceLayer as DecorationsLive } from "../Decorations/Decorations.js";
import { LiveEditorServiceLayer as EditorLive } from "../Editor/Editor.js";
import { LiveEnvironmentService as EnvironmentLive } from "../Environment.js";
import { LiveExtensionsServiceLayer as ExtensionsLive } from "../Extensions/Extensions.js";
import { LiveFilesService as FilesLive } from "../Files/Files.js";
import { LiveHistoryServiceLayer as HistoryLive } from "../History/History.js";
import { LiveKeybindingServiceLayer as KeybindingLive } from "../Keybinding/Keybinding.js";
import { LiveLabelServiceLayer as LabelLive } from "../Label/Label.js";
import { LiveLanguageServiceLayer as LanguageLive } from "../Language/Language.js";
import { LiveLifecycleServiceLayer as LifecycleLive } from "../Lifecycle/Lifecycle.js";
import { LiveModelService as ModelLive } from "../Model/Model.js";
import { MountainSyncLive } from "../MountainSync.js";
import { LiveNotificationServiceLayer as NotificationLive } from "../Notification/Notification.js";
import { LiveOutputServiceLayer as OutputLive } from "../Output/Output.js";
import { LivePanelService as PanelLive } from "../Panel.js";
import { LiveProgressServiceLayer as ProgressLive } from "../Progress/Progress.js";
import { LiveQuickInputServiceLayer as QuickInputLive } from "../QuickInput/QuickInput.js";
import { SandboxLive } from "../Sandbox.js";
import { LiveSearchServiceLayer as SearchLive } from "../Search/Search.js";
import { SidebarLive } from "../Sidebar.js";
import { LiveStatusBarService as StatusBarLive } from "../StatusBar.js";
import { LiveStorageServiceLayer as StorageLive } from "../Storage/Storage.js";
import { TelemetryLive } from "../Telemetry.js";
import { LiveTerminalServiceLayer as TerminalLive } from "../Terminal/Terminal.js";
import { default as LiveTextFileServiceLayer } from "../TextFile/Live.js";
import { LiveTextModelResolverServiceLayer as TextModelResolverLive } from "../TextModelResolver/TextModelResolver.js";
import { LiveThemesServiceLayer as ThemesLive } from "../Themes/Themes.js";
import { LiveWorkingCopyServiceLayer as WorkingCopyLive } from "../WorkingCopy/WorkingCopy.js";
import { LiveWorkspacesServiceLayer as WorkspacesLive } from "../Workspaces/Workspaces.js";

// ============================================================================
// Base Tauri Layer (without config sync)
// ============================================================================

/**
 * Base Tauri layer stack - services composed in a single Layer.mergeAll
 * instead of 40+ chained .pipe(Layer.provideMerge) calls, reducing
 * intermediate composition objects from O(n) to O(1).
 *
 * Provides: Sandbox + IPC + Telemetry + UI Services. Configuration and
 * Mountain are plain services exported from their Implementation modules.
 *
 * Use this when you need manual control over configuration sync.
 */
const BaseServices = Layer.mergeAll(
	SandboxLive,

	EnvironmentLive,

	ClipboardLive,

	TelemetryLive,

	MountainSyncLive,

	PanelLive,

	SidebarLive,

	StatusBarLive,

	CommandsLive,

	FilesLive,

	LanguageLive,

	ExtensionsLive,

	EditorLive,

	TerminalLive,

	OutputLive,

	LiveTextFileServiceLayer,

	StorageLive,

	NotificationLive,

	ProgressLive,

	QuickInputLive,

	WorkspacesLive,

	ThemesLive,

	SearchLive,

	DecorationsLive,

	WorkingCopyLive,

	KeybindingLive,

	LifecycleLive,

	HistoryLive,

	LabelLive,

	ModelLive,

	TextModelResolverLive,
);

export const TauriBaseLayer = BaseServices;

// ============================================================================
// Full Tauri Layer (with auto config sync)
// ============================================================================

/**
 * Full Tauri layer stack.
 * Provides: All base services. Mountain-driven configuration sync runs
 * inside the plain Mountain service while connected.
 */
export const TauriLiveLayer = Layer.mergeAll(
	SandboxLive,

	EnvironmentLive,

	ClipboardLive,

	TelemetryLive,

	MountainSyncLive,

	PanelLive,

	SidebarLive,

	StatusBarLive,

	CommandsLive,

	FilesLive,

	LanguageLive,

	ExtensionsLive,

	EditorLive,

	TerminalLive,

	OutputLive,

	LiveTextFileServiceLayer,

	StorageLive,

	NotificationLive,

	ProgressLive,

	QuickInputLive,

	WorkspacesLive,

	ThemesLive,

	SearchLive,

	DecorationsLive,

	WorkingCopyLive,

	KeybindingLive,

	LifecycleLive,

	HistoryLive,

	LabelLive,

	ModelLive,

	TextModelResolverLive,
);

// ============================================================================
// Tauri Development Layer (with verbose logging)
// ============================================================================

/**
 * Tauri layer with maximum telemetry and logging.
 * Useful for debugging and development - subset of services
 * sufficient for interactive debugging without full editor stack.
 */
export const TauriDevLayer = Layer.mergeAll(
	SandboxLive,

	EnvironmentLive,

	ClipboardLive,

	TelemetryLive,

	MountainSyncLive,

	PanelLive,

	SidebarLive,

	StatusBarLive,
);

// Export default for convenience
export default TauriLiveLayer;
