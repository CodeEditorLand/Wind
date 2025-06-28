import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteCodingAgentsService } from '../common/remoteCodingAgentsService.js';
export declare class RemoteCodingAgentsContribution extends Disposable implements IWorkbenchContribution {
    private readonly logService;
    private readonly remoteCodingAgentsService;
    constructor(logService: ILogService, remoteCodingAgentsService: IRemoteCodingAgentsService);
}
