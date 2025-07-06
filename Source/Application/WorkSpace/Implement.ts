/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `WorkSpaceService`.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "@codeeditorland/output/vs/workbench/services/remote/common/remoteAgentService.js";
import {
	IUserDataProfileService,
	IUserDataProfilesService,
} from "@codeeditorland/output/vs/workbench/services/userDataProfile/common/userDataProfile.js";
import { Layer } from "effect";

import { BrowserWorkbenchEnvironmentService } from "../BrowserWorkbenchEnvironment/Define.js";
import { FileService } from "../File/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { PolicyService } from "../Policy/Define.js";
import { RemoteAgentService } from "../RemoteAgent/Define.js";
import { UriIdentityService } from "../UriIdentity/Define.js";
import { UserDataProfileService } from "../UserDataProfile/Define.js";
import { WorkSpaceService } from "./Define.js";

// Placeholder for IUserDataProfilesService until fully implemented
const ProvideUserDataProfilesService = Layer.succeed(
	IUserDataProfilesService,
	{} as any,
);

/**
 * The live implementation `Layer` for the `WorkSpaceService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the extensive list of
 * dependencies required by the underlying VS Code `WorkspaceService` class.
 */
export const ProvideWorkSpace = WorkSpaceService.Default as Layer.Layer<
	WorkSpaceService,
	never,
	| IBrowserWorkbenchEnvironmentService
	| IUserDataProfileService
	| IUserDataProfilesService
	| IFileService
	| IRemoteAgentService
	| IUriIdentityService
	| ILogService
	| IPolicyService
>;
