/**
 * @module Service (Application/WorkSpace)
 * @description Defines the service that implements the `vscode.workspace` API.
 * It manages workspace-level state (folders, configuration) and editor state.
 */

import { Effect } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IPolicyService } from "vs/platform/policy/common/policy.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import type { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import { WorkspaceService as VSCodeWorkspaceService } from "vs/workbench/services/configuration/browser/configurationService.js";
import { IConfigurationCache } from "vs/workbench/services/configuration/common/configuration.js";
import { IJSONEditingService } from "vs/workbench/services/configuration/common/jsonEditing.js";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService.js";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService.js";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile.js";

/**
 * The `Effect.Service` for the `IWorkspaceContextService`.
 *
 * This service implementation "lifts" the original `WorkspaceService` class from
 * VS Code. It provides the complex logic for managing workspace state, folders,
 * and configuration scoping. The service is instantiated with its required
 * dependencies, which are resolved from our Effect-TS context via the DI bridge.
 * The identifier "workspaceContextService" is used for compatibility with legacy
 * VS Code service lookups.
 */
export class WorkSpaceService extends Effect.Service<IWorkspaceContextService>()(
	"workspaceContextService",
	{
		effect: Effect.gen(function* (Generator) {
			// This service has many dependencies. We will need to provide live layers
			// for all of them. For now, we can use stubs for some of them.
			const EnvironmentService = yield* Generator(
				IBrowserWorkbenchEnvironmentService,
			);
			const UserDataProfileService = yield* Generator(
				IUserDataProfileService,
			);
			const FileService = yield* Generator(IFileService);
			const RemoteAgentService = yield* Generator(IRemoteAgentService);
			const UriIdentityService = yield* Generator(IUriIdentityService);
			const LoggerService = yield* Generator(ILogService);
			const PolicyService = yield* Generator(IPolicyService);

			// Placeholder for the configuration cache. A real implementation would
			// likely use the StorageService.
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
				{} as any, // UserDataProfilesService
				FileService,
				RemoteAgentService,
				UriIdentityService,
				LoggerService,
				PolicyService,
			);

			return ServiceInstance;
		}),
	},
) {}
