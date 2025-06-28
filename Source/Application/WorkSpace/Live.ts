/**
 * @module Live (Application/WorkSpace)
 * @description Provides the "live" implementation `Layer` for the WorkSpace service.
 */

import { Layer } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IPolicyService } from "vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile.js";
import { WorkSpaceService } from "./Service.js";

/**
 * The live implementation `Layer` for the `WorkSpaceService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the extensive list of
 * dependencies required by the underlying VS Code `WorkspaceService` class.
 */
export const WorkSpaceLive: Layer.Layer<
	WorkSpaceService,
	never,
	| IBrowserWorkbenchEnvironmentService
	| IUserDataProfileService
	| IFileService
	| IRemoteAgentService
	| IUriIdentityService
	| ILogService
	| IPolicyService
> = WorkSpaceService.Default;
