/**
 * @module Service (Application/SourceControlManagement)
 * @description Defines the service interface and live implementation for the
 * Source Control Management service, which conforms to the `ISCMService`.
 */

import { Effect } from "effect";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import type { ISCMService } from "vs/workbench/contrib/scm/common/scm.js";
import { SourceControlManagementService as VscScmService } from "vs/workbench/contrib/scm/common/scmService.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { FromDTO as ProviderFromDTO } from "Source/TypeConverter/SourceControlManagement/Provider.js";
import { ScmProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `ISCMService`.
 *
 * This service implementation "lifts" the original `SourceControlManagementService`
 * class from VS Code. It orchestrates the following:
 * 1. Instantiates the real `VscScmService`.
 * 2. Defines an `Initialize` effect that fetches the complete initial SCM state
 *    from the `Mountain` host and sets up listeners for real-time updates.
 * 3. This `Initialize` effect must be run once at application startup.
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
			 * Listens for real-time SCM provider updates from the host.
			 */
			const ListenForProviderUpdates = Integration.Listen(
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
							Context: "ListenForProviderUpdatesFailed",
						}),
				),
			);

			// This `Initialize` method is an exposed Effect that must be run by the
			// application entry point to start the service's background processes.
			const Initialize = Effect.all([
				InitializeState,
				ListenForProviderUpdates,
			]).pipe(Effect.forkDaemon, Effect.asVoid);

			// The service contract includes the service instance and the initializer.
			// A consumer would get the service and then decide when to run Initialize.
			// However, for ISCMService, we return the instance directly, and expect
			// DesktopMain to call an initialization routine.
			// For simplicity here, we can fork the initialization.
			yield* Generator(Initialize);

			return ServiceInstance;
		}),
	},
) {}
