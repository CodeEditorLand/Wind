import { Layer } from "effect";

import { LiveClipboardService } from "../Clipboard.js";
import { LiveConfigurationService } from "../Configuration.js";
import { LiveDialogService } from "../Dialog.js";
import { LiveEditorService } from "../Editor.js";
import { LiveEditorGroupsService } from "../EditorGroups.js";
import { LiveEnvironmentService } from "../Environment.js";
import { LiveFileService } from "../File.js";
import { LiveFileSystemProvider } from "../FileSystem.js";
import { LiveHistoryService } from "../History.js";
import { LiveHostService, LiveNativeHostService } from "../Host.js";
import { LiveLayoutService } from "../Layout.js";
import { LiveLifecycleService } from "../Lifecycle.js";
import { LiveLogService } from "../Log.js";
import { LiveNotificationService } from "../Notification.js";
import { LivePaneCompositeService } from "../PaneComposite.js";
import { LiveStorageService } from "../Storage.js";
import { LiveTextEditorService } from "../TextEditor.js";
import { LiveViewDescriptorService } from "../Views.js";
import { LiveWorkspacesService } from "../Workspaces.js";

// The master application layer that composes all our native services.
export const AppLayer = Layer.mergeAll(
	LiveClipboardService,
	LiveConfigurationService,
	LiveDialogService,
	LiveEditorService,
	LiveEditorGroupsService,
	LiveEnvironmentService,
	LiveFileService,
	LiveFileSystemProvider,
	LiveHistoryService,
	LiveHostService,
	LiveNativeHostService,
	LiveLayoutService,
	LiveLifecycleService,
	LiveLogService,
	LiveNotificationService,
	LivePaneCompositeService,
	LiveStorageService,
	LiveTextEditorService,
	LiveViewDescriptorService,
	LiveWorkspacesService,
);
