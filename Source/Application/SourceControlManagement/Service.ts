/**
 * @module Service (Application/SourceControlManagement)
 * @description Defines the service interface and `Effect.Service` tag for the
 * Source Control Management service, conforming to the `ISCMService` contract.
 */

import { Effect } from "effect";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import {
	ISCMService,
	type ISCMProvider,
	type ISCMRepository,
} from "vs/workbench/contrib/scm/common/scm.js";
import { SourceControlManagementService as VscScmService } from "vs/workbench/contrib/scm/common/scmService.js";
import { HostService } from "Source/Application/Host/Service.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { ScmProblem } from "./Error.js";
import { FromDTO as ProviderFromDTO } from "Source/TypeConverter/SourceControlManagement/Provider.js";

/**
 * The `Effect.Service` for the `ISCMService`.
 *
 * This service implementation "lifts" the original `SourceControlManagementService`
 * class from VS Code. It orchestrates the following:
 * 1. Instantiates the real `VscScmService`.
 * 2. Fetches the complete initial SCM state from the `Mountain` host via the
 *    `IntegrationService` upon startup.
 * 3. Populates the service with the initial state (providers, repositories, groups).
 * 4. Sets up listeners for real-time update events from the host to keep the
 *    UI in sync.
 */
export class SourceControlManagementService extends Effect.Service<ISCMService>()(
	"scmService",
	{
		effect: Effect.gen(function* (Generator) {
			// Resolve legacy and modern service dependencies.
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const LogService = yield* Generator(ILogService);
			const ContextKeyService = yield* Generator(IContextKeyService);
			const WorkspaceContextService = yield* Generator(
				IWorkspaceContextService,
			);
			const StorageService = yield* Generator(IStorageService);
			const Integration = yield* Generator(IntegrationService);

			// Instantiate the real VS Code SCM service.
			const ServiceInstance = InstantiationService.createInstance(
				VscScmService,
				ContextKeyService,
				WorkspaceContextService,
				StorageService,
			);

			/**
			 * Fetches the full SCM state from the host and populates the service.
			 */
			const InitializeState = Integration.Invoke<any>(
				"GetAllSourceControlManagementState",
			).pipe(
				Effect.tap((State) =>
					LogService.trace(
						"[ScmService] Received initial SCM state:",
						State,
					),
				),
				Effect.flatMap((State) =>
					Effect.sync(() => {
						for (const ProviderDTO of Object.values(
							State.providers,
						)) {
							const Provider =
								ServiceInstance.registerSCMProvider(
									ProviderFromDTO(ProviderDTO as any),
								);
							// A full implementation would continue to populate groups and resources.
						}
					}),
				),
				Effect.mapError(
					(Cause) =>
						new ScmProblem({
							Cause,
							Context: "InitializeStateFailed",
						}),
				),
			);

			/**
			 * Listens for real-time updates from the host.
			 */
			const ListenForUpdates = Integration.Listen(
				"sky://scm/provider/added",
				(Event) => {
					LogService.info(
						`[ScmService] SCM Provider added:`,
						Event.payload,
					);
					ServiceInstance.registerSCMProvider(
						ProviderFromDTO(Event.payload as any),
					);
				},
			).pipe(
				Effect.mapError(
					(Cause) =>
						new ScmProblem({
							Cause,
							Context: "ListenForUpdatesFailed",
						}),
				),
			);

			// Fork the initialization and event listening to run in the background.
			yield* Generator(Effect.forkDaemon(InitializeState));
			yield* Generator(Effect.forkDaemon(ListenForUpdates));

			// Return the instantiated and populated service instance.
			return ServiceInstance;
		}),
	},
) {}
