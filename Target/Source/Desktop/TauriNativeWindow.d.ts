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
import { IEditorService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/editor/common/editorService.js';
import { IConfigurationService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/configuration/common/configuration.js';
import { ITitleService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/title/browser/titleService.js';
import { IWorkbenchThemeService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/themes/common/workbenchThemeService.js';
import { INotificationService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/notification/common/notification.js';
import { ICommandService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/commands/common/commands.js';
import { IKeybindingService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/keybinding/common/keybinding.js';
import { IWorkspaceEditingService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/workspaces/common/workspaceEditing.js';
import { IFileService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/files/common/files.js';
import { IMenuService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/actions/common/actions.js';
import { ILifecycleService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/lifecycle/common/lifecycle.js';
import { IIntegrityService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/integrity/common/integrity.js';
import { INativeWorkbenchEnvironmentService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/environment/electron-browser/environmentService.js';
import { IAccessibilityService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/accessibility/common/accessibility.js';
import { IWorkspaceContextService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/workspace/common/workspace.js';
import { IOpenerService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/opener/common/opener.js';
import { INativeHostService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/native/common/native.js';
import { ITunnelService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/tunnel/common/tunnel.js';
import { IWorkbenchLayoutService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/layout/browser/layoutService.js';
import { IWorkingCopyService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/workingCopy/common/workingCopyService.js';
import { IFilesConfigurationService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js';
import { IProductService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/product/common/productService.js';
import { IRemoteAuthorityResolverService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/remote/common/remoteAuthorityResolver.js';
import { IDialogService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/dialogs/common/dialogs.js';
import { IStorageService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/storage/common/storage.js';
import { ILogService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/log/common/log.js';
import { IInstantiationService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/instantiation/common/instantiation.js';
import { ISharedProcessService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/ipc/electron-browser/services.js';
import { IProgressService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/progress/common/progress.js';
import { ILabelService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/label/common/label.js';
import { IBannerService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/banner/browser/bannerService.js';
import { IUriIdentityService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/uriIdentity/common/uriIdentity.js';
import { IPreferencesService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/preferences/common/preferences.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IHostService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/services/host/browser/host.js';
import { IContextMenuService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/contextview/browser/contextView.js';
import { BaseWindow } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/workbench/browser/window.js';
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