import { ILocalMcpServer, IMcpManagementService, InstallOptions, InstallMcpServerEvent, UninstallMcpServerEvent, DidUninstallMcpServerEvent, InstallMcpServerResult, IInstallableMcpServer } from '../../../../platform/mcp/common/mcpManagement.js';
import { Event } from '../../../../base/common/event.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
export interface IWorkbencMcpServerInstallOptions extends InstallOptions {
    target?: ConfigurationTarget | IWorkspaceFolder;
}
export declare const enum LocalMcpServerScope {
    User = "user",
    RemoteUser = "remoteUser",
    Workspace = "workspace"
}
export interface IWorkbenchLocalMcpServer extends ILocalMcpServer {
    readonly scope?: LocalMcpServerScope;
}
export interface IWorkbenchMcpServerInstallResult extends InstallMcpServerResult {
    readonly local?: IWorkbenchLocalMcpServer;
}
export interface IWorkbenchMcpManagementService extends IMcpManagementService {
    readonly onDidInstallMcpServers: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onInstallMcpServerInCurrentProfile: Event<InstallMcpServerEvent>;
    readonly onDidInstallMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onUninstallMcpServerInCurrentProfile: Event<UninstallMcpServerEvent>;
    readonly onDidUninstallMcpServerInCurrentProfile: Event<DidUninstallMcpServerEvent>;
    getInstalled(): Promise<IWorkbenchLocalMcpServer[]>;
    install(server: IInstallableMcpServer, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
}
export declare const IWorkbenchMcpManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchMcpManagementService>;
