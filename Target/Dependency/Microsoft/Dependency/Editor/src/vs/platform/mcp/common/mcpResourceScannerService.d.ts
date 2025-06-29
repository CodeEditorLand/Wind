import { IStringDictionary } from '../../../base/common/collections.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Mutable } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { ConfigurationTarget } from '../../configuration/common/configuration.js';
import { IFileService } from '../../files/common/files.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IScannedMcpServer } from './mcpManagement.js';
import { IMcpServerVariable } from './mcpPlatformTypes.js';
interface IScannedMcpServers {
    servers?: IStringDictionary<Mutable<IScannedMcpServer>>;
    inputs?: IMcpServerVariable[];
}
export interface ProfileMcpServersEvent {
    readonly servers: readonly IScannedMcpServer[];
    readonly profileLocation: URI;
}
export interface DidAddProfileMcpServersEvent extends ProfileMcpServersEvent {
    readonly error?: Error;
}
export interface DidRemoveProfileMcpServersEvent extends ProfileMcpServersEvent {
    readonly error?: Error;
}
export type McpResourceTarget = ConfigurationTarget.USER | ConfigurationTarget.WORKSPACE | ConfigurationTarget.WORKSPACE_FOLDER;
export declare const IMcpResourceScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpResourceScannerService>;
export interface IMcpResourceScannerService {
    readonly _serviceBrand: undefined;
    scanMcpServers(mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServers>;
    addMcpServers(servers: {
        server: IScannedMcpServer;
        inputs?: IMcpServerVariable[];
    }[], mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServer[]>;
    removeMcpServers(serverNames: string[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
}
export declare class McpResourceScannerService extends Disposable implements IMcpResourceScannerService {
    private readonly fileService;
    protected readonly uriIdentityService: IUriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly resourcesAccessQueueMap;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    scanMcpServers(mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServers>;
    addMcpServers(servers: {
        server: IScannedMcpServer;
        inputs?: IMcpServerVariable[];
    }[], mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServer[]>;
    removeMcpServers(serverNames: string[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    private withProfileMcpServers;
    private writeScannedMcpServers;
    private writeScannedMcpServersToWorkspaceFolder;
    private writeScannedMcpServersToWorkspace;
    private fromUserMcpServers;
    private fromWorkspaceFolderMcpServers;
    private sanitizeServer;
    private toWorkspaceFolderMcpServers;
    private getResourceAccessQueue;
}
export {};
