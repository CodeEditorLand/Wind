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
	UserSettings,
	UserSettingsServiceTag,
} from "../UserSettings/Tag/UserSettingsServiceTag.js";

export type {
	WorkbenchActivity,
	WorkbenchActivityServiceTag,
} from "../WorkbenchActivity/Tag/WorkbenchActivityServiceTag.js";

export type {
	WorkbenchClipboard,
	WorkbenchClipboardServiceTag,
} from "../WorkbenchClipboard/Tag/WorkbenchClipboardServiceTag.js";

export type {
	WorkbenchCommand,
	WorkbenchCommandServiceTag,
} from "../WorkbenchCommand/Tag/WorkbenchCommandServiceTag.js";

export type {
	WorkbenchContextKey,
	WorkbenchContextKeyServiceTag,
} from "../WorkbenchContextKey/Tag/WorkbenchContextKeyServiceTag.js";

export type {
	WorkbenchDialog,
	WorkbenchDialogServiceTag,
} from "../WorkbenchDialog/Tag/WorkbenchDialogServiceTag.js";

export type {
	WorkbenchEditor,
	WorkbenchEditorServiceTag,
} from "../WorkbenchEditor/Tag/WorkbenchEditorServiceTag.js";

export type {
	WorkbenchExtension,
	WorkbenchExtensionServiceTag,
} from "../WorkbenchExtension/Tag/WorkbenchExtensionServiceTag.js";

export type {
	WorkbenchHost,
	WorkbenchHostServiceTag,
} from "../WorkbenchHost/Tag/WorkbenchHostServiceTag.js";

export type {
	WorkbenchKeybinding,
	WorkbenchKeybindingServiceTag,
} from "../WorkbenchKeybinding/Tag/WorkbenchKeybindingServiceTag.js";

export type {
	WorkbenchLayout,
	WorkbenchLayoutServiceTag,
} from "../WorkbenchLayout/Tag/WorkbenchLayoutServiceTag.js";

export type {
	WorkbenchLifecycle,
	WorkbenchLifecycleServiceTag,
} from "../WorkbenchLifecycle/Tag/WorkbenchLifecycleServiceTag.js";

export type {
	WorkbenchNotification,
	WorkbenchNotificationServiceTag,
} from "../WorkbenchNotification/Tag/WorkbenchNotificationServiceTag.js";

export type {
	WorkbenchProduct,
	WorkbenchProductServiceTag,
} from "../WorkbenchProduct/Tag/WorkbenchProductServiceTag.js";

export type {
	WorkbenchProgress,
	WorkbenchProgressServiceTag,
} from "../WorkbenchProgress/Tag/WorkbenchProgressServiceTag.js";

export type {
	WorkbenchStorage,
	WorkbenchStorageServiceTag,
} from "../WorkbenchStorage/Tag/WorkbenchStorageServiceTag.js";

export type {
	WorkbenchTheme,
	WorkbenchThemeServiceTag,
} from "../WorkbenchTheme/Tag/WorkbenchThemeServiceTag.js";

export type {
	WorkbenchWorkspace,
	WorkbenchWorkspaceServiceTag,
} from "../WorkbenchWorkspace/Tag/WorkbenchWorkspaceServiceTag.js";
