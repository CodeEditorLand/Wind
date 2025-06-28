import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { DidUninstallMcpServerEvent, IGalleryMcpServer, ILocalMcpServer, IMcpGalleryService, IMcpManagementService, IMcpServerManifest, InstallMcpServerEvent, InstallMcpServerResult, PackageType, UninstallMcpServerEvent, IScannedMcpServer, InstallOptions, UninstallOptions, IInstallableMcpServer } from './mcpManagement.js';
import { IMcpServerVariable, IMcpServerConfiguration } from './mcpPlatformTypes.js';
import { IMcpResourceScannerService, McpResourceTarget } from './mcpResourceScannerService.js';
export interface ILocalMcpServerInfo {
    name: string;
    version: string;
    id?: string;
    displayName?: string;
    url?: string;
    description?: string;
    repositoryUrl?: string;
    publisher?: string;
    publisherDisplayName?: string;
    icon?: {
        dark: string;
        light: string;
    };
    codicon?: string;
    manifest?: IMcpServerManifest;
    readmeUrl?: URI;
    location?: URI;
}
export declare abstract class AbstractMcpManagementService extends Disposable implements IMcpManagementService {
    protected readonly target: McpResourceTarget;
    protected readonly mcpGalleryService: IMcpGalleryService;
    protected readonly fileService: IFileService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly logService: ILogService;
    protected readonly mcpResourceScannerService: IMcpResourceScannerService;
    _serviceBrand: undefined;
    protected readonly _onInstallMcpServer: Emitter<InstallMcpServerEvent>;
    readonly onInstallMcpServer: import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerEvent>;
    protected readonly _onDidInstallMcpServers: Emitter<InstallMcpServerResult[]>;
    get onDidInstallMcpServers(): import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerResult[]>;
    protected readonly _onUninstallMcpServer: Emitter<UninstallMcpServerEvent>;
    get onUninstallMcpServer(): import("../../../workbench/workbench.web.main.internal.js").Event<UninstallMcpServerEvent>;
    protected _onDidUninstallMcpServer: Emitter<DidUninstallMcpServerEvent>;
    get onDidUninstallMcpServer(): import("../../../workbench/workbench.web.main.internal.js").Event<DidUninstallMcpServerEvent>;
    constructor(target: McpResourceTarget, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService);
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    protected scanServer(scannedMcpServer: IScannedMcpServer, mcpResource: URI): Promise<ILocalMcpServer>;
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    protected toScannedMcpServerAndInputs(manifest: IMcpServerManifest, packageType?: PackageType): {
        config: IMcpServerConfiguration;
        inputs?: IMcpServerVariable[];
    };
    private getCommandName;
    private getVariables;
    abstract installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    protected abstract getDefaultMcpResource(): URI;
    protected abstract getLocalMcpServerInfo(scannedMcpServer: IScannedMcpServer): Promise<ILocalMcpServerInfo | undefined>;
}
export declare class McpManagementService extends AbstractMcpManagementService implements IMcpManagementService {
    private readonly userDataProfilesService;
    private readonly mcpLocation;
    constructor(mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService, environmentService: IEnvironmentService, userDataProfilesService: IUserDataProfilesService);
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    protected getLocalMcpServerInfo(scannedMcpServer: IScannedMcpServer): Promise<ILocalMcpServerInfo | undefined>;
    protected getDefaultMcpResource(): URI;
    private getLocation;
}
