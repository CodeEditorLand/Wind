/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the SCM service.
 */

import { IContextKeyService } from "@codeeditorland/output/vs/platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { IWorkspaceContextService } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { Layer } from "effect";

import { ContextKeyService } from "../ContextKey/Define.js";
import { InstantiationService } from "../Instantiation/Define.js";
import { IntegrationService } from "../Integration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { StorageService } from "../Storage/Define.js";
import { WorkSpaceService } from "../WorkSpace/Define.js";
import { SourceControlManagementService } from "./Define.js";

/**
 * The live implementation `Layer` for the `SourceControlManagementService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor.
 */
export const ProvideSourceControlManagement =
	SourceControlManagementService.Default as Layer.Layer<
		SourceControlManagementService,
		never,
		| IInstantiationService
		| ILogService
		| IContextKeyService
		| IWorkspaceContextService
		| IStorageService
		| IntegrationService
	>;
