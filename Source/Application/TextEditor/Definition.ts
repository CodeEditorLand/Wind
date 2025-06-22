/*
 * File: Wind/Source/Application/TextEditor/Definition.ts
 * Role: Provides the live implementation of the `ITextFileService`.
 * Responsibilities:
 *   - Instantiates the canonical `TextFileService` from VS Code's source.
 *   - Overrides the `save` method to delegate the save operation to the `HostService`,
 *     which in turn calls the `Mountain` backend.
 */

import { Effect } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity.js";
import { IEditorService } from "vs/workbench/services/editor/common/editorService.js";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";
import { TextFileService as VscTextFileService } from "vs/workbench/services/textfile/common/textFileService.js";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService.js";

import { FileService } from "../File/mod.js";
import { HostService } from "../Host/mod.js";
import { InstantiationService } from "../Instantiation/mod.js";
import type { Interface as TextEditorServiceInterface } from "./Service.js";

/**
 * An Effect that builds the live implementation of the TextEditor service.
 */
const Definition = Effect.gen(function* (_) {
	const InstantiationServiceTag = yield* _(InstantiationService.Tag);
	const Host = yield* _(HostService.Tag);
	const LogService = yield* _(ILogService);
	const EditorService = yield* _(IEditorService);

	// A full implementation requires providing all these dependencies.
	// For now, we'll use stubs where possible.
	const ServiceInstance = InstantiationServiceTag.createInstance(
		VscTextFileService,
		// Dependencies of TextFileService:
		{} as IFileService,
		{} as IUntitledTextEditorService,
		{} as ILifecycleService,
		{} as IInstantiationService,
		{} as IFilesConfigurationService,
		{} as IWorkingCopyFileService,
		{} as IUriIdentityService,
		{} as ILogService,
	) as unknown as TextEditorServiceInterface;

	// Override the save method to delegate to our host.
	ServiceInstance.save = async (editor, options) => {
		const Resource = "resource" in editor ? editor.resource : editor;
		if (!Resource) {
			LogService.warn(
				"[TextFileService] Save called but no resource was found.",
			);
			return false;
		}

		LogService.info(
			`[TextFileService] Invoking 'Document.Save' for URI: ${Resource.toString()}`,
		);
		try {
			// Delegate the actual save operation to the host.
			await Effect.runPromise(Host.saveFile(Resource, options));
			return true;
		} catch (error) {
			LogService.error(
				`[TextFileService] Failed to save document ${Resource.toString()}:`,
				error,
			);
			return false;
		}
	};

	return ServiceInstance;
});

export default Definition;
