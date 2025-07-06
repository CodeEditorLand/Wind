/**
 * @module Define
 * @description
 * Defines the service interface and live implementation for the Source Control
 * Management service, which conforms to the `ISCMService` contract from VS Code.
 */

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
import { Effect } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import {
	FromDTO as ProviderFromDTO,
	type SourceControlManagementProviderDTO,
} from "./Convert.js";
import { SourceControlManagementProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `ISCMService`.
 *
 * This service implementation "lifts" the original `SCMService` class from
 * VS Code. It orchestrates the following:
 * 1. Instantiates the real `VSCodeSCMService`.
 * 2. Defines an `Initialize` effect that fetches the complete initial SCM state
 *    from the `Mountain` host and sets up listeners for real-time updates.
 * 3. This `Initialize` effect is forked as a daemon to run in the background.
 *
 * It is registered with the identifier "scmService" for compatibility.
 */
export class SourceControlManagementService extends Effect.Service<ISCMService>()(
	"scmService",
	{
		effect: Effect.gen(function* (Generator) {
			const InstantiationService = yield* Generator(
				IInstantiationService,
			);
			const Logger = yield* Generator(ILogService);
			const ContextKeyService = yield* Generator(IContextKeyService);
			const WorkspaceContextService = yield* Generator(
				IWorkspaceContextService,
			);
			const StorageService = yield* Generator(IStorageService);
			const Integration = yield* Generator(IntegrationService);

			const ServiceInstance = InstantiationService.createInstance(
				VSCodeSCMService,
				ContextKeyService,
				WorkspaceContextService,
				StorageService,
			);

			/**
			 * An Effect that fetches the full SCM state from the host and populates the service.
			 */
			const InitializeState = Integration.Invoke<{
				providers: Record<string, SourceControlManagementProviderDTO>;
			}>("GetAllSourceControlManagementState").pipe(
				Effect.tap((State) =>
					Logger.trace(
						"[SCMService] Received initial SCM state:",
						State,
					),
				),
				Effect.flatMap((State) =>
					Effect.sync(() => {
						for (const ProviderDTO of Object.values(
							State.providers,
						)) {
							ServiceInstance.registerSCMProvider(
								ProviderFromDTO(ProviderDTO) as ISCMProvider,
							);
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
			 * An Effect that listens for real-time SCM provider updates from the host.
			 */
			const ListenForProviderUpdates = Integration.Listen<any>(
				"sky://scm/provider/added",
				(Event) => {
					Logger.info(
						`[SCMService] SCM Provider added:`,
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

			const Initialize = Effect.all([
				InitializeState,
				ListenForProviderUpdates,
			]).pipe(Effect.forkDaemon);

			// Fork the initialization process to run in the background.
			yield* Generator(Initialize);

			return ServiceInstance;
		}),
	},
) {}
