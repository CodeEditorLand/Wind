/**
 * @module Live (Application/TextEditor)
 * @description Provides the "live" implementation `Layer` for the TextEditor service.
 */

import { Layer } from "effect";
import { IFileService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/log/common/log.js";
import { IUriIdentityService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/lifecycle/common/lifecycle.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/workingCopy/common/workingCopyFileService.js";

import { HostService } from "../Host/Service.js";
import { TextEditorService } from "./Service.js";

/**
 * The live implementation `Layer` for the `TextEditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `TextEditorService` service definition. It automatically includes all
 * dependencies required by its `effect` constructor.
 */
export const TextEditorLive: Layer.Layer<
	TextEditorService,
	never,
	| IInstantiationService
	| HostService
	| ILogService
	| IFileService
	| IUntitledTextEditorService
	| ILifecycleService
	| IFilesConfigurationService
	| IWorkingCopyFileService
	| IUriIdentityService
> = TextEditorService.Default;
