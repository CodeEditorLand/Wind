import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { DidUninstallMcpServerEvent, IGalleryMcpServer, ILocalMcpServer, IMcpManagementService, IInstallableMcpServer, InstallMcpServerEvent, InstallMcpServerResult, InstallOptions, UninstallMcpServerEvent, UninstallOptions } from './mcpManagement.js';
export declare class McpManagementChannel implements IServerChannel {
    private service;
    private getUriTransformer;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    readonly onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    readonly onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    readonly onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    constructor(service: IMcpManagementService, getUriTransformer: (requestContext: any) => IURITransformer | null);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class McpManagementChannelClient extends Disposable implements IMcpManagementService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onInstallMcpServer;
    get onInstallMcpServer(): Event<InstallMcpServerEvent>;
    private readonly _onDidInstallMcpServers;
    get onDidInstallMcpServers(): Event<readonly InstallMcpServerResult[]>;
    private readonly _onUninstallMcpServer;
    get onUninstallMcpServer(): Event<UninstallMcpServerEvent>;
    private readonly _onDidUninstallMcpServer;
    get onDidUninstallMcpServer(): Event<DidUninstallMcpServerEvent>;
    constructor(channel: IChannel);
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    installFromGallery(extension: IGalleryMcpServer, installOptions?: InstallOptions): Promise<ILocalMcpServer>;
    uninstall(extension: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
}
