/**
 * @module Effect/LandWorkbench/LandWorkbenchRuntime
 * @description
 * Eager plain-object registry of every workbench-tier Wind service.
 * Built immediately at module load time via IIFE so construction
 * cost is paid once during Sky bundle evaluation, not on first
 * Get() call.
 *
 * The registry is module-singleton via `globalThis.__CEL_WIND_RUNTIME__`
 * so two sibling Sky chunks importing this module land on the same instance.
 * @category Composition
 */

import type { UserSettingsService } from "../UserSettings/Interface/UserSettingsService.js";
import type { WorkbenchActivityService } from "../WorkbenchActivity/Interface/WorkbenchActivityService.js";
import type { WorkbenchClipboardService } from "../WorkbenchClipboard/Interface/WorkbenchClipboardService.js";
import type { WorkbenchCommandService } from "../WorkbenchCommand/Interface/WorkbenchCommandService.js";
import type { WorkbenchContextKeyService } from "../WorkbenchContextKey/Interface/WorkbenchContextKeyService.js";
import type { WorkbenchDialogService } from "../WorkbenchDialog/Interface/WorkbenchDialogService.js";
import type { WorkbenchEditorService } from "../WorkbenchEditor/Interface/WorkbenchEditorService.js";
import type { WorkbenchExtensionService } from "../WorkbenchExtension/Interface/WorkbenchExtensionService.js";
import type { WorkbenchHostService } from "../WorkbenchHost/Interface/WorkbenchHostService.js";
import type { WorkbenchKeybindingService } from "../WorkbenchKeybinding/Interface/WorkbenchKeybindingService.js";
import type { WorkbenchLayoutService } from "../WorkbenchLayout/Interface/WorkbenchLayoutService.js";
import type { WorkbenchLifecycleService } from "../WorkbenchLifecycle/Interface/WorkbenchLifecycleService.js";
import type { WorkbenchNotificationService } from "../WorkbenchNotification/Interface/WorkbenchNotificationService.js";
import type { WorkbenchProductService } from "../WorkbenchProduct/Interface/WorkbenchProductService.js";
import type { WorkbenchProgressService } from "../WorkbenchProgress/Interface/WorkbenchProgressService.js";
import type { WorkbenchStorageService } from "../WorkbenchStorage/Interface/WorkbenchStorageService.js";
import type { WorkbenchThemeService } from "../WorkbenchTheme/Interface/WorkbenchThemeService.js";
import type { WorkbenchWorkspaceService } from "../WorkbenchWorkspace/Interface/WorkbenchWorkspaceService.js";

import { UserSettingsLive } from "../UserSettings/Implementation/UserSettingsLive.js";
import { WorkbenchActivityLive } from "../WorkbenchActivity/Implementation/WorkbenchActivityLive.js";
import { WorkbenchClipboardLive } from "../WorkbenchClipboard/Implementation/WorkbenchClipboardLive.js";
import { WorkbenchCommandLive } from "../WorkbenchCommand/Implementation/WorkbenchCommandLive.js";
import { WorkbenchContextKeyLive } from "../WorkbenchContextKey/Implementation/WorkbenchContextKeyLive.js";
import { WorkbenchDialogLive } from "../WorkbenchDialog/Implementation/WorkbenchDialogLive.js";
import { WorkbenchEditorLive } from "../WorkbenchEditor/Implementation/WorkbenchEditorLive.js";
import { WorkbenchExtensionLive } from "../WorkbenchExtension/Implementation/WorkbenchExtensionLive.js";
import { WorkbenchHostLive } from "../WorkbenchHost/Implementation/WorkbenchHostLive.js";
import { WorkbenchKeybindingLive } from "../WorkbenchKeybinding/Implementation/WorkbenchKeybindingLive.js";
import { WorkbenchLayoutLive } from "../WorkbenchLayout/Implementation/WorkbenchLayoutLive.js";
import { WorkbenchLifecycleLive } from "../WorkbenchLifecycle/Implementation/WorkbenchLifecycleLive.js";
import { WorkbenchNotificationLive } from "../WorkbenchNotification/Implementation/WorkbenchNotificationLive.js";
import { WorkbenchProductLive } from "../WorkbenchProduct/Implementation/WorkbenchProductLive.js";
import { WorkbenchProgressLive } from "../WorkbenchProgress/Implementation/WorkbenchProgressLive.js";
import { WorkbenchStorageLive } from "../WorkbenchStorage/Implementation/WorkbenchStorageLive.js";
import { WorkbenchThemeLive } from "../WorkbenchTheme/Implementation/WorkbenchThemeLive.js";
import { WorkbenchWorkspaceLive } from "../WorkbenchWorkspace/Implementation/WorkbenchWorkspaceLive.js";

export interface LandWorkbenchServices {
	readonly UserSettings: UserSettingsService;

	readonly Activity: WorkbenchActivityService;

	readonly Clipboard: WorkbenchClipboardService;

	readonly Command: WorkbenchCommandService;

	readonly ContextKey: WorkbenchContextKeyService;

	readonly Dialog: WorkbenchDialogService;

	readonly Editor: WorkbenchEditorService;

	readonly Extension: WorkbenchExtensionService;

	readonly Host: WorkbenchHostService;

	readonly Keybinding: WorkbenchKeybindingService;

	readonly Layout: WorkbenchLayoutService;

	readonly Lifecycle: WorkbenchLifecycleService;

	readonly Notification: WorkbenchNotificationService;

	readonly Product: WorkbenchProductService;

	readonly Progress: WorkbenchProgressService;

	readonly Storage: WorkbenchStorageService;

	readonly Theme: WorkbenchThemeService;

	readonly Workspace: WorkbenchWorkspaceService;
}

interface LandWorkbenchRuntimeGlobal {
	__CEL_WIND_RUNTIME__?: LandWorkbenchServices;
}

// Eagerly initialize at module load time - eliminates first-call latency.
const _Services = (() => {
	const Globals = globalThis as unknown as LandWorkbenchRuntimeGlobal;

	if (!Globals.__CEL_WIND_RUNTIME__) {
		Globals.__CEL_WIND_RUNTIME__ = {
			UserSettings: UserSettingsLive,

			Activity: WorkbenchActivityLive,

			Clipboard: WorkbenchClipboardLive,

			Command: WorkbenchCommandLive,

			ContextKey: WorkbenchContextKeyLive,

			Dialog: WorkbenchDialogLive,

			Editor: WorkbenchEditorLive,

			Extension: WorkbenchExtensionLive,

			Host: WorkbenchHostLive,

			Keybinding: WorkbenchKeybindingLive,

			Layout: WorkbenchLayoutLive,

			Lifecycle: WorkbenchLifecycleLive,

			Notification: WorkbenchNotificationLive,

			Product: WorkbenchProductLive,

			Progress: WorkbenchProgressLive,

			Storage: WorkbenchStorageLive,

			Theme: WorkbenchThemeLive,

			Workspace: WorkbenchWorkspaceLive,
		};
	}

	return Globals.__CEL_WIND_RUNTIME__;
})();

export const LandWorkbenchRuntime = {
	Get: (): LandWorkbenchServices => _Services,

	Dispose: async (): Promise<void> => {
		delete (globalThis as unknown as LandWorkbenchRuntimeGlobal)
			.__CEL_WIND_RUNTIME__;
	},
};

export default LandWorkbenchRuntime;
