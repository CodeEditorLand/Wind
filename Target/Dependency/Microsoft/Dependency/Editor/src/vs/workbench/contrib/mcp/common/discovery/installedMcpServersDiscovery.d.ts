import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IMcpRegistry } from '../mcpRegistryTypes.js';
import { IMcpWorkbenchService } from '../mcpTypes.js';
import { IMcpDiscovery } from './mcpDiscovery.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IRemoteAgentService } from '../../../../services/remote/common/remoteAgentService.js';
export declare class InstalledMcpServersDiscovery extends Disposable implements IMcpDiscovery {
    private readonly mcpWorkbenchService;
    private readonly mcpRegistry;
    private readonly remoteAgentService;
    private readonly textModelService;
    private readonly collectionDisposables;
    constructor(mcpWorkbenchService: IMcpWorkbenchService, mcpRegistry: IMcpRegistry, remoteAgentService: IRemoteAgentService, textModelService: ITextModelService);
    start(): void;
    private getServerIdMapping;
    private sync;
}
