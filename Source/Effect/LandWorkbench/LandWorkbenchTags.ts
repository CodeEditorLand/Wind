/**
 * @module Effect/LandWorkbench/LandWorkbenchTags
 * @description
 * Single re-export point for every `Workbench<X>ServiceTag` Wind
 * provides. Consumers `import { WorkbenchStorage, WorkbenchTheme }
 * from "@codeeditorland/wind/.../LandWorkbenchTags.js"` once and
 * yield each tag from inside `Effect.gen`.
 * @category Composition
 */

export {
	UserSettingsServiceTag,
	UserSettings,
} from "../UserSettings/Tag/UserSettingsServiceTag.js";
export {
	WorkbenchActivityServiceTag,
	WorkbenchActivity,
} from "../WorkbenchActivity/Tag/WorkbenchActivityServiceTag.js";
export {
	WorkbenchClipboardServiceTag,
	WorkbenchClipboard,
} from "../WorkbenchClipboard/Tag/WorkbenchClipboardServiceTag.js";
export {
	WorkbenchCommandServiceTag,
	WorkbenchCommand,
} from "../WorkbenchCommand/Tag/WorkbenchCommandServiceTag.js";
export {
	WorkbenchContextKeyServiceTag,
	WorkbenchContextKey,
} from "../WorkbenchContextKey/Tag/WorkbenchContextKeyServiceTag.js";
export {
	WorkbenchDialogServiceTag,
	WorkbenchDialog,
} from "../WorkbenchDialog/Tag/WorkbenchDialogServiceTag.js";
export {
	WorkbenchEditorServiceTag,
	WorkbenchEditor,
} from "../WorkbenchEditor/Tag/WorkbenchEditorServiceTag.js";
export {
	WorkbenchExtensionServiceTag,
	WorkbenchExtension,
} from "../WorkbenchExtension/Tag/WorkbenchExtensionServiceTag.js";
export {
	WorkbenchHostServiceTag,
	WorkbenchHost,
} from "../WorkbenchHost/Tag/WorkbenchHostServiceTag.js";
export {
	WorkbenchKeybindingServiceTag,
	WorkbenchKeybinding,
} from "../WorkbenchKeybinding/Tag/WorkbenchKeybindingServiceTag.js";
export {
	WorkbenchLayoutServiceTag,
	WorkbenchLayout,
} from "../WorkbenchLayout/Tag/WorkbenchLayoutServiceTag.js";
export {
	WorkbenchLifecycleServiceTag,
	WorkbenchLifecycle,
} from "../WorkbenchLifecycle/Tag/WorkbenchLifecycleServiceTag.js";
export {
	WorkbenchNotificationServiceTag,
	WorkbenchNotification,
} from "../WorkbenchNotification/Tag/WorkbenchNotificationServiceTag.js";
export {
	WorkbenchProductServiceTag,
	WorkbenchProduct,
} from "../WorkbenchProduct/Tag/WorkbenchProductServiceTag.js";
export {
	WorkbenchProgressServiceTag,
	WorkbenchProgress,
} from "../WorkbenchProgress/Tag/WorkbenchProgressServiceTag.js";
export {
	WorkbenchStorageServiceTag,
	WorkbenchStorage,
} from "../WorkbenchStorage/Tag/WorkbenchStorageServiceTag.js";
export {
	WorkbenchThemeServiceTag,
	WorkbenchTheme,
} from "../WorkbenchTheme/Tag/WorkbenchThemeServiceTag.js";
export {
	WorkbenchWorkspaceServiceTag,
	WorkbenchWorkspace,
} from "../WorkbenchWorkspace/Tag/WorkbenchWorkspaceServiceTag.js";
