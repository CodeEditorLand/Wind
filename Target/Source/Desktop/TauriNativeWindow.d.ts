/**
 * @module TauriNativeWindow
 * @description
 * Tauri implementation of VSCode's NativeWindow functionality.
 * This replaces Electron-specific window management with Tauri APIs.
 *
 * Architecture:
 * 1. Window lifecycle management using Tauri window APIs
 * 2. File operations with Tauri file dialogs
 * 3. System integration (menus, notifications, etc.)
 * 4. IPC communication with Tauri backend
 *
 * TODOs:
 * - Implement Tauri window management APIs
 * - Create Tauri file dialog integration
 * - Add Tauri menu system integration
 * - Implement Tauri IPC event handlers
 * - Handle Tauri-specific window features
 */
import { IAccessibilityService } from "@codeeditorland/output/vs/platform/accessibility/common/accessibility.js";
import { IMenuService } from "@codeeditorland/output/vs/platform/actions/common/actions.js";
import { ICommandService } from "@codeeditorland/output/vs/platform/commands/common/commands.js";
import { IConfigurationService } from "@codeeditorland/output/vs/platform/configuration/common/configuration.js";
import { IContextMenuService } from "@codeeditorland/output/vs/platform/contextview/browser/contextView.js";
import { IDialogService } from "@codeeditorland/output/vs/platform/dialogs/common/dialogs.js";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { ISharedProcessService } from "@codeeditorland/output/vs/platform/ipc/electron-browser/services.js";
import { IKeybindingService } from "@codeeditorland/output/vs/platform/keybinding/common/keybinding.js";
import { ILabelService } from "@codeeditorland/output/vs/platform/label/common/label.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { INativeHostService } from "@codeeditorland/output/vs/platform/native/common/native.js";
import { INotificationService } from "@codeeditorland/output/vs/platform/notification/common/notification.js";
import { IOpenerService } from "@codeeditorland/output/vs/platform/opener/common/opener.js";
import { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import { IProgressService } from "@codeeditorland/output/vs/platform/progress/common/progress.js";
import { IRemoteAuthorityResolverService } from "@codeeditorland/output/vs/platform/remote/common/remoteAuthorityResolver.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { ITunnelService } from "@codeeditorland/output/vs/platform/tunnel/common/tunnel.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceContextService } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { BaseWindow } from "@codeeditorland/output/vs/workbench/browser/window.js";
import { IBannerService } from "@codeeditorland/output/vs/workbench/services/banner/browser/bannerService.js";
import { IEditorService } from "@codeeditorland/output/vs/workbench/services/editor/common/editorService.js";
import { INativeWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/electron-browser/environmentService.js";
import { IFilesConfigurationService } from "@codeeditorland/output/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { IHostService } from "@codeeditorland/output/vs/workbench/services/host/browser/host.js";
import { IIntegrityService } from "@codeeditorland/output/vs/workbench/services/integrity/common/integrity.js";
import { IWorkbenchLayoutService } from "@codeeditorland/output/vs/workbench/services/layout/browser/layoutService.js";
import { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import { IPreferencesService } from "@codeeditorland/output/vs/workbench/services/preferences/common/preferences.js";
import { IWorkbenchThemeService } from "@codeeditorland/output/vs/workbench/services/themes/common/workbenchThemeService.js";
import { ITitleService } from "@codeeditorland/output/vs/workbench/services/title/browser/titleService.js";
import { IUtilityProcessWorkerWorkbenchService } from "@codeeditorland/output/vs/workbench/services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js";
import { IWorkingCopyService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyService.js";
import { IWorkspaceEditingService } from "@codeeditorland/output/vs/workbench/services/workspaces/common/workspaceEditing.js";
export declare class TauriNativeWindow extends BaseWindow {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly titleService;
    protected themeService: IWorkbenchThemeService;
    private readonly notificationService;
    private readonly commandService;
    private readonly keybindingService;
    private readonly workspaceEditingService;
    private readonly fileService;
    private readonly menuService;
    private readonly lifecycleService;
    private readonly integrityService;
    private readonly nativeEnvironmentService;
    private readonly accessibilityService;
    private readonly contextService;
    private readonly openerService;
    private readonly nativeHostService;
    private readonly tunnelService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    private readonly productService;
    private readonly remoteAuthorityResolverService;
    private readonly dialogService;
    private readonly storageService;
    private readonly logService;
    private readonly instantiationService;
    private readonly sharedProcessService;
    private readonly progressService;
    private readonly labelService;
    private readonly bannerService;
    private readonly uriIdentityService;
    private readonly preferencesService;
    private readonly utilityProcessWorkerWorkbenchService;
    private readonly customTitleContextMenuDisposable;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, titleService: ITitleService, themeService: IWorkbenchThemeService, notificationService: INotificationService, commandService: ICommandService, keybindingService: IKeybindingService, workspaceEditingService: IWorkspaceEditingService, fileService: IFileService, menuService: IMenuService, lifecycleService: ILifecycleService, integrityService: IIntegrityService, nativeEnvironmentService: INativeWorkbenchEnvironmentService, accessibilityService: IAccessibilityService, contextService: IWorkspaceContextService, openerService: IOpenerService, nativeHostService: INativeHostService, tunnelService: ITunnelService, layoutService: IWorkbenchLayoutService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService, productService: IProductService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, dialogService: IDialogService, storageService: IStorageService, logService: ILogService, instantiationService: IInstantiationService, sharedProcessService: ISharedProcessService, progressService: IProgressService, labelService: ILabelService, bannerService: IBannerService, uriIdentityService: IUriIdentityService, preferencesService: IPreferencesService, utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService, hostService: IHostService, contextMenuService: IContextMenuService);
    protected registerListeners(): void;
    private registerTauriEventHandlers;
    protected create(): void;
    private handleWarnings;
    private setupOpenHandlers;
    private updateTouchbarMenu;
    private updateWindowBorder;
    private resolveConfiguredWindowZoomLevel;
    private onDidChangeConfiguredWindowZoomLevel;
    dispose(): void;
}
interface IEditorGroupsService {
}
export {};
//# sourceMappingURL=TauriNativeWindow.d.ts.map