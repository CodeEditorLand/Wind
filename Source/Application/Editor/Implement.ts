/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `EditorService`.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
// Placeholders for unimplemented dependencies
import { IFilesConfigurationService } from "@codeeditorland/output/vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "@codeeditorland/output/vs/workbench/services/lifecycle/common/lifecycle.js";
import { IUntitledTextEditorService } from "@codeeditorland/output/vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "@codeeditorland/output/vs/workbench/services/workingCopy/common/workingCopyFileService.js";
import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { InstantiationService } from "../Instantiation/Define.js";
import { LifecycleService } from "../Lifecycle/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { TextEditorService } from "../TextEditor/Define.js";
import { UntitledTextEditorService } from "../UntitledTextEditor/Define.js";
import { UriIdentityService } from "../UriIdentity/Define.js";
import { WorkingCopyFileService } from "../WorkingCopyFile/Define.js";
import { EditorService } from "./Define.js";

// A dummy layer for IFileService for now
const ProvideFileService = Layer.succeed(IFileService, {
	onDidFilesChange: Effect.never,
	onDidRunOperation: Effect.never,
	onWillRunOperation: Effect.never,
} as any);

// A dummy layer for IFilesConfigurationService
const ProvideFilesConfigurationService = Layer.succeed(
	IFilesConfigurationService,
	{} as any,
);

/**
 * The live implementation `Layer` for the `EditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `EditorService` definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as `HostService`
 * and `TextEditorService`.
 */
export const ProvideEditor = EditorService.Default as Layer.Layer<
	EditorService,
	never,
	| HostService
	| TextEditorService
	| IInstantiationService
	| ILogService
	| IFileService
	| IUntitledTextEditorService
	| ILifecycleService
	| IFilesConfigurationService
	| IWorkingCopyFileService
	| IUriIdentityService
>;
