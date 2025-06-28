import { ActionViewItem, IActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { Action, IAction } from '../../../../base/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMcpSamplingService, IMcpServerContainer, IMcpService, IMcpWorkbenchService, IWorkbenchMcpServer } from '../common/mcpTypes.js';
import { IMcpRegistry } from '../common/mcpRegistryTypes.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IAuthenticationQueryService } from '../../../services/authentication/common/authenticationQuery.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
export declare abstract class McpServerAction extends Action implements IMcpServerContainer {
    static readonly EXTENSION_ACTION_CLASS = "extension-action";
    static readonly TEXT_ACTION_CLASS: string;
    static readonly LABEL_ACTION_CLASS: string;
    static readonly PROMINENT_LABEL_ACTION_CLASS: string;
    static readonly ICON_ACTION_CLASS: string;
    private _mcpServer;
    get mcpServer(): IWorkbenchMcpServer | null;
    set mcpServer(mcpServer: IWorkbenchMcpServer | null);
    abstract update(): void;
}
export declare abstract class DropDownAction extends McpServerAction {
    protected instantiationService: IInstantiationService;
    constructor(id: string, label: string, cssClass: string, enabled: boolean, instantiationService: IInstantiationService);
    private _actionViewItem;
    createActionViewItem(options: IActionViewItemOptions): DropDownExtensionActionViewItem;
    run(actionGroups: IAction[][]): Promise<any>;
}
export declare class DropDownExtensionActionViewItem extends ActionViewItem {
    private readonly contextMenuService;
    constructor(action: IAction, options: IActionViewItemOptions, contextMenuService: IContextMenuService);
    showMenu(menuActionGroups: IAction[][]): void;
    private getActions;
}
export declare class InstallAction extends McpServerAction {
    private readonly mcpWorkbenchService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpWorkbenchService: IMcpWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class UninstallAction extends McpServerAction {
    private readonly mcpWorkbenchService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpWorkbenchService: IMcpWorkbenchService);
    update(): void;
    run(): Promise<any>;
}
export declare class ManageMcpServerAction extends DropDownAction {
    private readonly isEditorAction;
    static readonly ID = "mcpServer.manage";
    private static readonly Class;
    private static readonly HideManageExtensionClass;
    constructor(isEditorAction: boolean, instantiationService: IInstantiationService);
    getActionGroups(): Promise<IAction[][]>;
    run(): Promise<any>;
    update(): void;
}
export declare class StartServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class StopServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class RestartServerAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class AuthServerAction extends McpServerAction {
    private readonly mcpService;
    private readonly _authenticationQueryService;
    private readonly _authenticationService;
    static readonly CLASS: string;
    private static readonly HIDE;
    private static readonly SIGN_OUT;
    private static readonly DISCONNECT;
    private _accountQuery;
    constructor(mcpService: IMcpService, _authenticationQueryService: IAuthenticationQueryService, _authenticationService: IAuthenticationService);
    update(): void;
    run(): Promise<void>;
    private getServer;
    private getAccountQuery;
}
export declare class ShowServerOutputAction extends McpServerAction {
    private readonly mcpService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class ShowServerConfigurationAction extends McpServerAction {
    private readonly mcpService;
    private readonly mcpRegistry;
    private readonly editorService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, mcpRegistry: IMcpRegistry, editorService: IEditorService);
    update(): void;
    run(): Promise<any>;
    private getConfigurationTarget;
}
export declare class ConfigureModelAccessAction extends McpServerAction {
    private readonly mcpService;
    private readonly commandService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, commandService: ICommandService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class ShowSamplingRequestsAction extends McpServerAction {
    private readonly mcpService;
    private readonly samplingService;
    private readonly editorService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, samplingService: IMcpSamplingService, editorService: IEditorService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
export declare class BrowseResourcesAction extends McpServerAction {
    private readonly mcpService;
    private readonly commandService;
    static readonly CLASS: string;
    private static readonly HIDE;
    constructor(mcpService: IMcpService, commandService: ICommandService);
    update(): void;
    run(): Promise<any>;
    private getServer;
}
