/**
 * @module Live (Application/TextEditor)
 * @description Provides the "live" implementation `Layer` for the TextEditor service.
 */
import { Layer } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService.js";

import { HostService } from "../Host/Service.js";
import { TextEditorService } from "./Service.js";

/**
 * The live implementation `Layer` for the `TextEditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `TextEditorService` service definition. It automatically includes all
 * dependencies required by its `effect` constructor.
 */
export declare const TextEditorLive: Layer.Layer<
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
>;
