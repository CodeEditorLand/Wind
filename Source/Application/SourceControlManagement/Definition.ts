/*
 * File: Wind/Source/Application/SourceControlManagement/Definition.ts
 * Role: Provides the live implementation of the SourceControlManagement service.
 * Responsibilities:
 *   - Instantiates the canonical `SourceControlManagementService` from VS Code's source code.
 *   - Fetches the initial, complete SourceControlManagement state from the Mountain backend upon startup.
 *   - Listens for real-time SourceControlManagement state change events from Mountain.
 *   - Updates the internal state of the `SourceControlManagementService` instance, which in turn
 *     drives the workbench UI.
 */

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";
import { URI } from "vs/base/common/uri.js";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import { SourceControlManagementService as VscSourceControlManagementService } from "vs/workbench/contrib/scm/common/scmService.js";

// Mirroring DTOs from Mountain/Source/ApplicationState/DTO/
interface SourceControlManagementProviderDTO {
	Handle: number;
	Label: string;
	RootUri?: string;
	// ... other properties like CommitTemplate, Count, etc.
}
interface SourceControlManagementGroupDTO {
	Id: string;
	Label: string;
	// ... other properties
}
interface SourceControlManagementResourceDTO {
	ResourceUri: string;
	// ... other properties
}

interface FullSourceControlManagementState {
	providers: Record<number, SourceControlManagementProviderDTO>;
	groups: Record<number, Record<string, SourceControlManagementGroupDTO>>;
}

/**
 * An Effect that builds the live implementation of the SourceControlManagement service.
 */
const Definition = Effect.gen(function* (_) {
	const LogService = yield* _(ILogService);
	const ContextKeyService = yield* _(IContextKeyService);
	const WorkspaceContextService = yield* _(IWorkspaceContextService);
	const StorageService = yield* _(IStorageService);
	const InstantiationService = yield* _(IInstantiationService);

	// Instantiate the real VS Code SourceControlManagement service.
	const ServiceInstance = InstantiationService.createInstance(VscSourceControlManagementService);

	const initialize = async () => {
		LogService.info(
			"[SourceControlManagementService] Initializing and fetching full SourceControlManagement state...",
		);
		try {
			const fullState = await invoke<FullSourceControlManagementState>("GetAllSourceControlManagementState");
			LogService.trace(
				"[SourceControlManagementService] Received initial SourceControlManagement state:",
				fullState,
			);

			// Populate the service with the initial state.
			for (const providerDTO of Object.values(fullState.providers)) {
				const provider = ServiceInstance.registerSourceControlManagementProvider({
					id: String(providerDTO.Handle),
					label: providerDTO.Label,
					rootUri: providerDTO.RootUri
						? URI.parse(providerDTO.RootUri)
						: undefined,
				});

				const providerGroups =
					fullState.groups[providerDTO.Handle] ?? {};
				for (const groupDTO of Object.values(providerGroups)) {
					provider.createGroup(groupDTO.Id, groupDTO.Label);
				}
			}

			// Listen for real-time updates from Mountain.
			await listen("sky://scm/provider/added", (event) => {
				const DTO = event.payload as SourceControlManagementProviderDTO;
				LogService.info(
					`[SourceControlManagementService] SourceControlManagement Provider added: ${DTO.Label}`,
				);
				ServiceInstance.registerSourceControlManagementProvider({
					id: String(DTO.Handle),
					label: DTO.Label,
					rootUri: DTO.RootUri ? URI.parse(DTO.RootUri) : undefined,
				});
			});
			// ... other listeners for group changes, resource changes, etc.
		} catch (e) {
			LogService.error("[SourceControlManagementService] Failed to initialize SourceControlManagement state:", e);
		}
	};

	// Kick off initialization in the background.
	initialize();

	return ServiceInstance;
});

export default Definition;
