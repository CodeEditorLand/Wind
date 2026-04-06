import { Layer } from "effect";
import { ActivityBarLive } from "../ActivityBar.js";
import { BootstrapLive } from "../Bootstrap.js";
import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { LiveCommandsServiceLayer as CommandsLive } from "../Commands/Commands.js";
import {
  ConfigurationLive,
  ConfigurationWithSyncLive
} from "../Configuration.js";
import { LiveDecorationsServiceLayer as DecorationsLive } from "../Decorations/Decorations.js";
import { LiveEditorServiceLayer as EditorLive } from "../Editor/Editor.js";
import { EnvironmentLive } from "../Environment.js";
import { LiveExtensionsServiceLayer as ExtensionsLive } from "../Extensions/Extensions.js";
import { LiveFilesServiceLayer as FilesLive } from "../Files/Files.js";
import { HealthLive } from "../Health.js";
import { LiveKeybindingServiceLayer as KeybindingLive } from "../Keybinding/Keybinding.js";
import { LiveLanguageServiceLayer as LanguageLive } from "../Language/Language.js";
import { LiveLifecycleServiceLayer as LifecycleLive } from "../Lifecycle/Lifecycle.js";
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
const TauriBaseLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive),
  // Editor service layers (depend on CommandsLive / IPC)
  Layer.provide(CommandsLive),
  Layer.provide(FilesLive),
  Layer.provide(LanguageLive),
  Layer.provide(ExtensionsLive),
  Layer.provide(EditorLive),
  // Tier 2 service layers
  Layer.provide(TerminalLive),
  Layer.provide(OutputLive),
  Layer.provide(LiveTextFileServiceLayer),
  // Tier 3 service layers
  Layer.provide(StorageLive),
  Layer.provide(NotificationLive),
  Layer.provide(ProgressLive),
  Layer.provide(QuickInputLive),
  Layer.provide(WorkspacesLive),
  Layer.provide(ThemesLive),
  Layer.provide(SearchLive),
  // P1 service layers
  Layer.provide(DecorationsLive),
  Layer.provide(WorkingCopyLive),
  Layer.provide(KeybindingLive),
  Layer.provide(LifecycleLive)
);
const TauriLiveLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive),
  // Editor service layers (depend on CommandsLive / IPC)
  Layer.provide(CommandsLive),
  Layer.provide(FilesLive),
  Layer.provide(LanguageLive),
  Layer.provide(ExtensionsLive),
  Layer.provide(EditorLive),
  // Tier 2 service layers
  Layer.provide(TerminalLive),
  Layer.provide(OutputLive),
  Layer.provide(LiveTextFileServiceLayer),
  // Tier 3 service layers
  Layer.provide(StorageLive),
  Layer.provide(NotificationLive),
  Layer.provide(ProgressLive),
  Layer.provide(QuickInputLive),
  Layer.provide(WorkspacesLive),
  Layer.provide(ThemesLive),
  Layer.provide(SearchLive),
  // P1 service layers
  Layer.provide(DecorationsLive),
  Layer.provide(WorkingCopyLive),
  Layer.provide(KeybindingLive),
  Layer.provide(LifecycleLive)
);
const TauriDevLayer = Layer.empty.pipe(
  Layer.provide(SandboxLive),
  Layer.provide(EnvironmentLive),
  Layer.provide(ClipboardLive),
  Layer.provide(TelemetryLive),
  Layer.provide(ConfigurationWithSyncLive),
  Layer.provide(MountainLive),
  Layer.provide(MountainSyncLive),
  Layer.provide(HealthLive),
  Layer.provide(BootstrapLive),
  Layer.provide(ActivityBarLive),
  Layer.provide(PanelLive),
  Layer.provide(SidebarLive),
  Layer.provide(StatusBarLive)
);
var Tauri_default = TauriLiveLayer;
export {
  TauriBaseLayer,
  TauriDevLayer,
  TauriLiveLayer,
  Tauri_default as default
};
//# sourceMappingURL=Tauri.js.map
