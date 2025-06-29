import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
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
export declare abstract class AbstractMcpResourceManagementService extends Disposable implements IMcpManagementService {
    protected readonly mcpResource: URI;
    protected readonly target: McpResourceTarget;
    protected readonly mcpGalleryService: IMcpGalleryService;
    protected readonly fileService: IFileService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly logService: ILogService;
    protected readonly mcpResourceScannerService: IMcpResourceScannerService;
    _serviceBrand: undefined;
    private initializePromise;
    private readonly reloadConfigurationScheduler;
    private local;
    protected readonly _onInstallMcpServer: Emitter<InstallMcpServerEvent>;
    readonly onInstallMcpServer: import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerEvent>;
    protected readonly _onDidInstallMcpServers: Emitter<InstallMcpServerResult[]>;
    get onDidInstallMcpServers(): import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerResult[]>;
    protected readonly _onDidUpdateMcpServers: Emitter<InstallMcpServerResult[]>;
    get onDidUpdateMcpServers(): import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerResult[]>;
    protected readonly _onUninstallMcpServer: Emitter<UninstallMcpServerEvent>;
    get onUninstallMcpServer(): import("../../../workbench/workbench.web.main.internal.js").Event<UninstallMcpServerEvent>;
    protected _onDidUninstallMcpServer: Emitter<DidUninstallMcpServerEvent>;
    get onDidUninstallMcpServer(): import("../../../workbench/workbench.web.main.internal.js").Event<DidUninstallMcpServerEvent>;
    constructor(mcpResource: URI, target: McpResourceTarget, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService);
    private initialize;
    private populateLocalServer;
    private startWatching;
    private updateLocal;
    getInstalled(): Promise<ILocalMcpServer[]>;
    protected scanServer(scannedMcpServer: IScannedMcpServer): Promise<ILocalMcpServer>;
    install(server: IInstallableMcpServer, options?: Omit<InstallOptions, 'mcpResource'>): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: Omit<UninstallOptions, 'mcpResource'>): Promise<void>;
    protected toScannedMcpServerAndInputs(manifest: IMcpServerManifest, packageType?: PackageType): {
        config: IMcpServerConfiguration;
        inputs?: IMcpServerVariable[];
    };
    private getCommandName;
    private getVariables;
    abstract installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    protected abstract getLocalMcpServerInfo(scannedMcpServer: IScannedMcpServer): Promise<ILocalMcpServerInfo | undefined>;
}
export declare class McpUserResourceManagementService extends AbstractMcpResourceManagementService implements IMcpManagementService {
    private readonly mcpLocation;
    constructor(mcpResource: URI, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService, environmentService: IEnvironmentService);
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    protected getLocalMcpServerInfo(scannedMcpServer: IScannedMcpServer): Promise<ILocalMcpServerInfo | undefined>;
    private getLocation;
}
export declare class McpManagementService extends Disposable implements IMcpManagementService {
    private readonly userDataProfilesService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onInstallMcpServer;
    readonly onInstallMcpServer: import("../../../workbench/workbench.web.main.internal.js").Event<InstallMcpServerEvent>;
    private readonly _onDidInstallMcpServers;
    readonly onDidInstallMcpServers: import("../../../workbench/workbench.web.main.internal.js").Event<readonly InstallMcpServerResult[]>;
    private readonly _onDidUpdateMcpServers;
    readonly onDidUpdateMcpServers: import("../../../workbench/workbench.web.main.internal.js").Event<readonly InstallMcpServerResult[]>;
    private readonly _onUninstallMcpServer;
    readonly onUninstallMcpServer: import("../../../workbench/workbench.web.main.internal.js").Event<UninstallMcpServerEvent>;
    private readonly _onDidUninstallMcpServer;
    readonly onDidUninstallMcpServer: import("../../../workbench/workbench.web.main.internal.js").Event<DidUninstallMcpServerEvent>;
    private readonly mcpResourceManagementServices;
    constructor(userDataProfilesService: IUserDataProfilesService, instantiationService: IInstantiationService);
    private getMcpResourceManagementService;
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    dispose(): void;
}
