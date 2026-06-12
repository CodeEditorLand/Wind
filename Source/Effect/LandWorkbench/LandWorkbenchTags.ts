/**
 * @module Effect/LandWorkbench/LandWorkbenchTags
 * @description
 * Single re-export point for every `Workbench<X>ServiceTag` Wind
 * provides. Consumers `import { WorkbenchStorage, WorkbenchTheme }
 * from "@codeeditorland/wind/.../LandWorkbenchTags.js"` once and
 * use each type alias in annotations.
 * @category Composition
 */

export type {
	UserSettingsServiceTag,
	UserSettings,
} from "../UserSettings/Tag/UserSettingsServiceTag.js";

export type {
	WorkbenchActivityServiceTag,
	WorkbenchActivity,
} from "../WorkbenchActivity/Tag/WorkbenchActivityServiceTag.js";

export type {
	WorkbenchClipboardServiceTag,
	WorkbenchClipboard,
} from "../WorkbenchClipboard/Tag/WorkbenchClipboardServiceTag.js";

export type {
	WorkbenchCommandServiceTag,
	WorkbenchCommand,
} from "../WorkbenchCommand/Tag/WorkbenchCommandServiceTag.js";

export type {
	WorkbenchContextKeyServiceTag,
	WorkbenchContextKey,
} from "../WorkbenchContextKey/Tag/WorkbenchContextKeyServiceTag.js";

export type {
	WorkbenchDialogServiceTag,
	WorkbenchDialog,
} from "../WorkbenchDialog/Tag/WorkbenchDialogServiceTag.js";

export type {
	WorkbenchEditorServiceTag,
	WorkbenchEditor,
} from "../WorkbenchEditor/Tag/WorkbenchEditorServiceTag.js";

export type {
	WorkbenchExtensionServiceTag,
	WorkbenchExtension,
} from "../WorkbenchExtension/Tag/WorkbenchExtensionServiceTag.js";

export type {
	WorkbenchHostServiceTag,
	WorkbenchHost,
} from "../WorkbenchHost/Tag/WorkbenchHostServiceTag.js";

export type {
	WorkbenchKeybindingServiceTag,
	WorkbenchKeybinding,
} from "../WorkbenchKeybinding/Tag/WorkbenchKeybindingServiceTag.js";

export type {
	WorkbenchLayoutServiceTag,
	WorkbenchLayout,
} from "../WorkbenchLayout/Tag/WorkbenchLayoutServiceTag.js";

export type {
	WorkbenchLifecycleServiceTag,
	WorkbenchLifecycle,
} from "../WorkbenchLifecycle/Tag/WorkbenchLifecycleServiceTag.js";

export type {
	WorkbenchNotificationServiceTag,
	WorkbenchNotification,
} from "../WorkbenchNotification/Tag/WorkbenchNotificationServiceTag.js";

export type {
	WorkbenchProductServiceTag,
	WorkbenchProduct,
} from "../WorkbenchProduct/Tag/WorkbenchProductServiceTag.js";

export type {
	WorkbenchProgressServiceTag,
	WorkbenchProgress,
} from "../WorkbenchProgress/Tag/WorkbenchProgressServiceTag.js";

export type {
	WorkbenchStorageServiceTag,
	WorkbenchStorage,
} from "../WorkbenchStorage/Tag/WorkbenchStorageServiceTag.js";

export type {
	WorkbenchThemeServiceTag,
	WorkbenchTheme,
} from "../WorkbenchTheme/Tag/WorkbenchThemeServiceTag.js";

export type {
	WorkbenchWorkspaceServiceTag,
	WorkbenchWorkspace,
} from "../WorkbenchWorkspace/Tag/WorkbenchWorkspaceServiceTag.js";
