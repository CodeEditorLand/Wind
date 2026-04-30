/**
 * @module Codegen/Manifest/WorkbenchBridgeShapeManifest
 * @description
 * Developer-curated narrowing for each Wind workbench service.
 * One entry per `Effect/Workbench<X>/` folder, declaring which
 * upstream interface members the Wind Live layer consumes.
 *
 * Adding a new method to a Live layer requires updating its
 * manifest entry - codegen will refuse to widen the bridge shape
 * silently. Removing an upstream member surfaces as a missing
 * key in the `Pick<…>` union, breaking the build.
 *
 * Order of entries follows alphabetical decorator name so diffs
 * stay reviewable. Every entry MUST cite its decorator's
 * `createDecorator(...)` source path in a JSDoc comment so a
 * new contributor can navigate to upstream verbatim.
 * @category Manifest
 */

import type { BridgeShapeManifestEntry } from "../Emit/EmitBridgeShapeBatch.js";

export const WorkbenchBridgeShapeManifest: ReadonlyArray<BridgeShapeManifestEntry> = [
	{
		// @upstream src/vs/platform/clipboard/common/clipboardService.ts
		DecoratorName: "IClipboardService",
		ServiceFolder: "WorkbenchClipboard",
		BridgeFileName: "WorkbenchClipboardBridgeShapeGenerated",
		PickMembers: [
			"readText",
			"writeText",
			"readResources",
			"writeResources",
		],
	},
	{
		// @upstream src/vs/platform/commands/common/commands.ts
		DecoratorName: "ICommandService",
		ServiceFolder: "WorkbenchCommand",
		BridgeFileName: "WorkbenchCommandBridgeShapeGenerated",
		PickMembers: [
			"executeCommand",
			"onWillExecuteCommand",
			"onDidExecuteCommand",
		],
	},
	{
		// @upstream src/vs/platform/configuration/common/configuration.ts
		DecoratorName: "IConfigurationService",
		ServiceFolder: "UserSettings",
		BridgeFileName: "UserSettingsBridgeShapeGenerated",
		PickMembers: [
			"getValue",
			"updateValue",
			"inspect",
			"onDidChangeConfiguration",
		],
	},
	{
		// @upstream src/vs/platform/contextkey/common/contextkey.ts
		DecoratorName: "IContextKeyService",
		ServiceFolder: "WorkbenchContextKey",
		BridgeFileName: "WorkbenchContextKeyBridgeShapeGenerated",
		PickMembers: [
			"getContextKeyValue",
			"createKey",
			"contextMatchesRules",
			"onDidChangeContext",
		],
	},
	{
		// @upstream src/vs/platform/dialogs/common/dialogs.ts
		DecoratorName: "IDialogService",
		ServiceFolder: "WorkbenchDialog",
		BridgeFileName: "WorkbenchDialogBridgeShapeGenerated",
		PickMembers: ["confirm", "prompt", "info", "warn", "error"],
	},
	{
		// @upstream src/vs/workbench/services/editor/common/editorService.ts
		DecoratorName: "IEditorService",
		ServiceFolder: "WorkbenchEditor",
		BridgeFileName: "WorkbenchEditorBridgeShapeGenerated",
		PickMembers: [
			"activeEditorPane",
			"openEditor",
			"closeEditor",
			"onDidActiveEditorChange",
		],
	},
	{
		// @upstream src/vs/workbench/services/extensions/common/extensions.ts
		DecoratorName: "IExtensionService",
		ServiceFolder: "WorkbenchExtension",
		BridgeFileName: "WorkbenchExtensionBridgeShapeGenerated",
		PickMembers: [
			"extensions",
			"activateById",
			"activateByEvent",
			"onDidChangeExtensions",
		],
	},
	{
		// @upstream src/vs/workbench/services/host/browser/host.ts
		DecoratorName: "IHostService",
		ServiceFolder: "WorkbenchHost",
		BridgeFileName: "WorkbenchHostBridgeShapeGenerated",
		PickMembers: [
			"reload",
			"restart",
			"close",
			"focus",
			"openWindow",
			"onDidChangeFocus",
			"hadLastFocus",
		],
	},
	{
		// @upstream src/vs/platform/keybinding/common/keybinding.ts
		DecoratorName: "IKeybindingService",
		ServiceFolder: "WorkbenchKeybinding",
		BridgeFileName: "WorkbenchKeybindingBridgeShapeGenerated",
		PickMembers: [
			"lookupKeybindings",
			"resolveKeyboardEvent",
			"dispatchByUserSettingsLabel",
		],
	},
	{
		// @upstream src/vs/workbench/services/lifecycle/common/lifecycle.ts
		DecoratorName: "ILifecycleService",
		ServiceFolder: "WorkbenchLifecycle",
		BridgeFileName: "WorkbenchLifecycleBridgeShapeGenerated",
		PickMembers: ["phase", "when", "onWillShutdown", "onDidShutdown"],
	},
	{
		// @upstream src/vs/platform/notification/common/notification.ts
		DecoratorName: "INotificationService",
		ServiceFolder: "WorkbenchNotification",
		BridgeFileName: "WorkbenchNotificationBridgeShapeGenerated",
		PickMembers: ["notify", "info", "warn", "error"],
	},
	{
		// @upstream src/vs/platform/product/common/productService.ts
		DecoratorName: "IProductService",
		ServiceFolder: "WorkbenchProduct",
		BridgeFileName: "WorkbenchProductBridgeShapeGenerated",
		PickMembers: [
			"nameLong",
			"nameShort",
			"version",
			"commit",
			"date",
			"quality",
			"applicationName",
			"extensionsGallery",
		],
	},
	{
		// @upstream src/vs/platform/progress/common/progress.ts
		DecoratorName: "IProgressService",
		ServiceFolder: "WorkbenchProgress",
		BridgeFileName: "WorkbenchProgressBridgeShapeGenerated",
		PickMembers: ["withProgress"],
	},
	{
		// @upstream src/vs/platform/storage/common/storage.ts
		DecoratorName: "IStorageService",
		ServiceFolder: "WorkbenchStorage",
		BridgeFileName: "WorkbenchStorageBridgeShapeGenerated",
		PickMembers: [
			"get",
			"getBoolean",
			"getNumber",
			"getObject",
			"store",
			"remove",
			"keys",
			"onDidChangeValue",
		],
	},
	{
		// @upstream src/vs/workbench/services/themes/common/workbenchThemeService.ts
		DecoratorName: "IWorkbenchThemeService",
		ServiceFolder: "WorkbenchTheme",
		BridgeFileName: "WorkbenchThemeBridgeShapeGenerated",
		PickMembers: [
			"getColorTheme",
			"getColorThemes",
			"setColorTheme",
			"onDidColorThemeChange",
		],
	},
	{
		// @upstream src/vs/platform/workspace/common/workspace.ts
		DecoratorName: "IWorkspaceContextService",
		ServiceFolder: "WorkbenchWorkspace",
		BridgeFileName: "WorkbenchWorkspaceBridgeShapeGenerated",
		PickMembers: [
			"getWorkspace",
			"getWorkspaceFolder",
			"onDidChangeWorkspaceFolders",
		],
	},
	{
		// @upstream src/vs/workbench/services/activity/common/activity.ts
		DecoratorName: "IActivityService",
		ServiceFolder: "WorkbenchActivity",
		BridgeFileName: "WorkbenchActivityBridgeShapeGenerated",
		PickMembers: [
			"showViewContainerActivity",
			"showViewActivity",
			"showAccountsActivity",
			"showGlobalActivity",
		],
	},
	{
		// @upstream src/vs/workbench/services/layout/browser/layoutService.ts
		DecoratorName: "IWorkbenchLayoutService",
		ServiceFolder: "WorkbenchLayout",
		BridgeFileName: "WorkbenchLayoutBridgeShapeGenerated",
		PickMembers: [
			"isVisible",
			"setPartHidden",
			"onDidChangePartVisibility",
		],
	},
];

export default WorkbenchBridgeShapeManifest;
