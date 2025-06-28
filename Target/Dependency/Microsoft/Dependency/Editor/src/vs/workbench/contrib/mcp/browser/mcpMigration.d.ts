import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchMcpManagementService } from '../../../services/mcp/common/mcpWorkbenchManagementService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
export declare class McpConfigMigrationContribution extends Disposable implements IWorkbenchContribution {
    private readonly mcpManagementService;
    private readonly userDataProfileService;
    private readonly fileService;
    private readonly remoteAgentService;
    private readonly jsonEditingService;
    private readonly logService;
    static ID: string;
    constructor(mcpManagementService: IWorkbenchMcpManagementService, userDataProfileService: IUserDataProfileService, fileService: IFileService, remoteAgentService: IRemoteAgentService, jsonEditingService: IJSONEditingService, logService: ILogService);
    private migrateMcpConfig;
    private parseMcpConfig;
    private removeMcpConfig;
}
