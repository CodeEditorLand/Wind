/**
 * @module Service (Application/SourceControlManagement)
 * @description Defines the service interface and live implementation for the
 * Source Control Management service, which conforms to the `ISCMService`.
 */

import { Effect } from "effect";
import { IContextKeyService } from "@codeeditorland/output/vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import {
	ISCMService,
	type ISCMProvider,
} from "@codeeditorland/output/vs/workbench/contrib/scm/common/scm.js";
import { SCMService as VSCodeSCMService } from "@codeeditorland/output/vs/workbench/contrib/scm/common/scmService.js";

import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { FromDTO as ProviderFromDTO } from "../../TypeConverter/SourceControlManagement/Provider.js";
import { SourceControlManagementProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `ISCMService`.
 *
 * This service implementation "lifts" the original `SourceControlManagementService`
 * class from VS Code. It orchestrates the following:
 * 1. Instantiates the real `VSCodeSCMService`.
 * 2. Defines an `Initialize` effect that fetches the complete initial SCM state
 *    from the `Mountain` host and sets up listeners for real-time updates.
 * 3. This `Initialize` effect must be run once at application startup.
 */
export class SourceControlManagementService extends Effect.Service<ISCMService>()(
	"scmService",
	{
		effect: Effect.gen(function* () {
			// Resolve legacy and modern service dependencies.
			const InstantiationService = yield* IInstantiationService;
			const LoggerService = yield* ILogService;
			const ContextKeyService = yield* IContextKeyService;
			const WorkspaceContextService = yield* IWorkspaceContextService;
			const StorageService = yield* IStorageService;
			const Integration = yield* IntegrationService;

			// Instantiate the real VS Code SCM service.
			const ServiceInstance = InstantiationService.createInstance(
				VSCodeSCMService,
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
					LoggerService.trace(
						"[SourceControlManagementService] Received initial SCM state:",
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
						new SourceControlManagementProblem({
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
					LoggerService.info(
						`[SourceControlManagementService] SCM Provider added:`,
						Event.payload,
					);
					ServiceInstance.registerSCMProvider(
						ProviderFromDTO(Event.payload as any) as ISCMProvider,
					);
				},
			).pipe(
				Effect.mapError(
					(Cause) =>
						new SourceControlManagementProblem({
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
			yield* Initialize;

			return ServiceInstance;
		}),
	},
) {}
