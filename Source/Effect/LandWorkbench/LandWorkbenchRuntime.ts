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

import { UserSettingsLive } from "../UserSettings/Implementation/UserSettingsLive.js";

import type { UserSettingsService } from "../UserSettings/Interface/UserSettingsService.js";

import { WorkbenchActivityLive } from "../WorkbenchActivity/Implementation/WorkbenchActivityLive.js";

import type { WorkbenchActivityService } from "../WorkbenchActivity/Interface/WorkbenchActivityService.js";

import { WorkbenchClipboardLive } from "../WorkbenchClipboard/Implementation/WorkbenchClipboardLive.js";

import type { WorkbenchClipboardService } from "../WorkbenchClipboard/Interface/WorkbenchClipboardService.js";

import { WorkbenchCommandLive } from "../WorkbenchCommand/Implementation/WorkbenchCommandLive.js";

import type { WorkbenchCommandService } from "../WorkbenchCommand/Interface/WorkbenchCommandService.js";

import { WorkbenchContextKeyLive } from "../WorkbenchContextKey/Implementation/WorkbenchContextKeyLive.js";

import type { WorkbenchContextKeyService } from "../WorkbenchContextKey/Interface/WorkbenchContextKeyService.js";

import { WorkbenchDialogLive } from "../WorkbenchDialog/Implementation/WorkbenchDialogLive.js";

import type { WorkbenchDialogService } from "../WorkbenchDialog/Interface/WorkbenchDialogService.js";

import { WorkbenchEditorLive } from "../WorkbenchEditor/Implementation/WorkbenchEditorLive.js";

import type { WorkbenchEditorService } from "../WorkbenchEditor/Interface/WorkbenchEditorService.js";

import { WorkbenchExtensionLive } from "../WorkbenchExtension/Implementation/WorkbenchExtensionLive.js";

import type { WorkbenchExtensionService } from "../WorkbenchExtension/Interface/WorkbenchExtensionService.js";

import { WorkbenchHostLive } from "../WorkbenchHost/Implementation/WorkbenchHostLive.js";

import type { WorkbenchHostService } from "../WorkbenchHost/Interface/WorkbenchHostService.js";

import { WorkbenchKeybindingLive } from "../WorkbenchKeybinding/Implementation/WorkbenchKeybindingLive.js";

import type { WorkbenchKeybindingService } from "../WorkbenchKeybinding/Interface/WorkbenchKeybindingService.js";

import { WorkbenchLayoutLive } from "../WorkbenchLayout/Implementation/WorkbenchLayoutLive.js";

import type { WorkbenchLayoutService } from "../WorkbenchLayout/Interface/WorkbenchLayoutService.js";

import { WorkbenchLifecycleLive } from "../WorkbenchLifecycle/Implementation/WorkbenchLifecycleLive.js";

import type { WorkbenchLifecycleService } from "../WorkbenchLifecycle/Interface/WorkbenchLifecycleService.js";

import { WorkbenchNotificationLive } from "../WorkbenchNotification/Implementation/WorkbenchNotificationLive.js";

import type { WorkbenchNotificationService } from "../WorkbenchNotification/Interface/WorkbenchNotificationService.js";

import { WorkbenchProductLive } from "../WorkbenchProduct/Implementation/WorkbenchProductLive.js";

import type { WorkbenchProductService } from "../WorkbenchProduct/Interface/WorkbenchProductService.js";

import { WorkbenchProgressLive } from "../WorkbenchProgress/Implementation/WorkbenchProgressLive.js";

import type { WorkbenchProgressService } from "../WorkbenchProgress/Interface/WorkbenchProgressService.js";

import { WorkbenchStorageLive } from "../WorkbenchStorage/Implementation/WorkbenchStorageLive.js";

import type { WorkbenchStorageService } from "../WorkbenchStorage/Interface/WorkbenchStorageService.js";

import { WorkbenchThemeLive } from "../WorkbenchTheme/Implementation/WorkbenchThemeLive.js";

import type { WorkbenchThemeService } from "../WorkbenchTheme/Interface/WorkbenchThemeService.js";

import { WorkbenchWorkspaceLive } from "../WorkbenchWorkspace/Implementation/WorkbenchWorkspaceLive.js";

import type { WorkbenchWorkspaceService } from "../WorkbenchWorkspace/Interface/WorkbenchWorkspaceService.js";

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
