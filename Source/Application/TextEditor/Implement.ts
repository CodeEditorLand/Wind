/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `TextEditorService`,
 * which is responsible for managing text file models.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "@codeeditorland/output/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { TextEditorService } from "./Define.js";

/**
 * The live implementation `Layer` for the `TextEditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes all legacy and modern
 * dependencies required by its `effect` constructor.
 */
export const ProvideTextEditor = TextEditorService.Default as Layer.Layer<
	TextEditorService,
	never,
	| IInstantiationService
	| HostService
	| LoggerService
	| IFileService
	| IUntitledTextEditorService
	| ILifecycleService
	| IFilesConfigurationService
	| IWorkingCopyFileService
	| IUriIdentityService
>;
