/**
 * @module Definition (TextEditor/Application)
 * @description The live implementation of the ITextEditorService.
 */

import { Effect } from "effect";
import { IFileService } from "vs/platform/files/common/files.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { TextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService.js";

import { File } from "../File/mod.js";
import { Instantiation } from "../Instantiation/mod.js";

// Assuming a stubbed or real UntitledTextEditorService exists
// import { UntitledTextEditorService } from "../UntitledTextEditor/mod.js";

/**
 * An Effect that builds the live implementation of the TextEditor service.
 *
 * This implementation uses the canonical `TextEditorService` class from VS Code's
 * source, providing it with the necessary dependencies from our own Effect-based services.
 */
const Definition = Effect.gen(function* (_) {
	// Depend on the services required by the TextEditorService constructor.
	const InstantiationService = yield* _(Instantiation.Tag);
	const FileService = yield* _(File.Tag);
	// const UntitledTextEditorService = yield* _(UntitledTextEditorService.Tag);

	// A full implementation would require a live UntitledTextEditorService.
	const ServiceInstance = new TextEditorService(
		InstantiationService,
		FileService,
		{} as IUntitledTextEditorService, // Stubbed dependency
	);

	return ServiceInstance;
});

export default Definition;
