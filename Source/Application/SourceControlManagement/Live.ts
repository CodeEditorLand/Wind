/**
 * @module Live (Application/SourceControlManagement)
 * @description Provides the "live" implementation `Layer` for the SCM service.
 */

import { Layer } from "effect";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { SourceControlManagementService } from "./Service.js";

/**
 * The live implementation `Layer` for the `SourceControlManagementService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `SourceControlManagementService` service definition. It automatically
 * includes the dependencies required by its `effect` constructor.
 */
export const SourceControlManagementLive: Layer.Layer<
	SourceControlManagementService,
	never,
	| IInstantiationService
	| ILogService
	| IContextKeyService
	| IWorkspaceContextService
	| IStorageService
	| IntegrationService
> = SourceControlManagementService.Default;
