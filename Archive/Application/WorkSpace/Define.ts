/**
 * @module Define
 * @description
 * Defines the service that implements the `vscode.workspace` API surface.
 * It manages workspace-level state, such as folders and configuration,
 * by lifting the complex `WorkspaceService` from VS Code's source.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "@codeeditorland/output/vs/platform/userDataProfile/common/userDataProfile.js";
import type { IWorkspaceContextService } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { WorkspaceService as VSCodeWorkspaceService } from "@codeeditorland/output/vs/workbench/services/configuration/browser/configurationService.js";
import { type IConfigurationCache } from "@codeeditorland/output/vs/workbench/services/configuration/common/configuration.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "@codeeditorland/output/vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "@codeeditorland/output/vs/workbench/services/userDataProfile/common/userDataProfile.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IWorkspaceContextService`.
 *
 * This service implementation "lifts" the original `WorkspaceService` class from
 * VS Code. It provides the complex logic for managing workspace state, folders,
 * and configuration scoping. The service is instantiated with its required
 * dependencies, which are resolved from our Effect-TS context via DI.
 *
 * It is registered with the identifier "workspaceContextService" for compatibility
 * with legacy VS Code service lookups.
 */
export class WorkSpaceService extends Effect.Service<IWorkspaceContextService>()(
	"workspaceContextService",
	{
		effect: Effect.gen(function* (Generator) {
			const EnvironmentService = yield* Generator(
				IBrowserWorkbenchEnvironmentService,
			);
			const UserDataProfileService = yield* Generator(
				IUserDataProfileService,
			);
			const UserDataProfilesService = yield* Generator(
				IUserDataProfilesService,
			);
			const FileService = yield* Generator(IFileService);
			const RemoteAgentService = yield* Generator(IRemoteAgentService);
			const UriIdentityService = yield* Generator(IUriIdentityService);
			const Logger = yield* Generator(ILogService);
			const PolicyService = yield* Generator(IPolicyService);

			// Placeholder for the configuration cache. A real implementation could
			// use the StorageService to persist this across sessions.
			const ConfigurationCache: IConfigurationCache = {
				read: () => Promise.resolve(""),
				write: () => Promise.resolve(),
				remove: () => Promise.resolve(),
				needsCaching: () => false,
			};

			const ServiceInstance = new VSCodeWorkspaceService(
				{
					remoteAuthority: EnvironmentService.remoteAuthority,
					configurationCache: ConfigurationCache,
				},
				EnvironmentService,
				UserDataProfileService,
				UserDataProfilesService,
				FileService,
				RemoteAgentService,
				UriIdentityService,
				Logger,
				PolicyService,
			);

			return ServiceInstance;
		}),
	},
) {}
