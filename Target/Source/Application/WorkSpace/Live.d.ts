/**
 * @module Live (Application/WorkSpace)
 * @description Provides the "live" implementation `Layer` for the WorkSpace service.
 */
import { Layer } from "effect";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "@codeeditorland/output/vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "@codeeditorland/output/vs/workbench/services/userDataProfile/common/userDataProfile.js";
import { WorkSpaceService } from "./Service.js";
/**
 * The live implementation `Layer` for the `WorkSpaceService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the extensive list of
 * dependencies required by the underlying VS Code `WorkspaceService` class.
 */
export declare const WorkSpaceLive: Layer.Layer<WorkSpaceService, never, IBrowserWorkbenchEnvironmentService | IUserDataProfileService | IFileService | IRemoteAgentService | IUriIdentityService | ILogService | IPolicyService>;
//# sourceMappingURL=Live.d.ts.map