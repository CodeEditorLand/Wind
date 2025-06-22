/*
 * File: Wind/Source/Application/Editor/Definition.ts
 * Role: Provides the live implementation of the `IEditorService`.
 * Responsibilities:
 *   - Implements the `openEditor` method to handle requests from the workbench UI.
 *   - Delegates the actual opening logic to the `HostService`, which communicates
 *     with the native `Mountain` backend.
 *   - The backend is the source of truth for document state and editor management.
 */

import { Effect, Runtime } from "effect";
import { Emitter, type Event } from "vs/base/common/event.js";
import { isEditorInput, type IEditorPane } from "vs/workbench/common/editor.js";
import type { EditorInput } from "vs/workbench/common/editor/editorInput.js";
import {
	findGroup,
	isPreferredGroup,
} from "vs/workbench/services/editor/common/editorGroupFinder.js";
import type {
	IActiveEditorChangeEvent,
	IEditorIdentifier,
	IEditorOptions,
	IEditorService,
	IRevertAllEditorsOptions,
	IRevertOptions,
	ISaveAllEditorsOptions,
	ISaveEditorsOptions,
	IUntypedEditorInput,
	PreferredGroup,
} from "vs/workbench/services/editor/common/editorService.js";

import { HostService } from "../Host/mod.js";
import { InstantiationService } from "../Instantiation/mod.js";
import { TextEditorService } from "../TextEditor/mod.js";
import type { ServiceProblem } from "./Error/mod.js";

/**
 * An Effect that builds the live implementation of the Editor service.
 */
const Definition = Effect.gen(function* (_) {
	const InstantiationServiceTag = yield* _(InstantiationService.Tag);
	const TextEditorServiceTag = yield* _(TextEditor.Tag);
	const Host = yield* _(HostService.Tag);

	const AppRuntime = yield* _(Effect.runtime<never>());
	const RunPromise = Runtime.runPromise(AppRuntime);

	// --- Internal Effect Constructor ---
	const CreateOpenEditorEffect = (
		Editor: EditorInput | IUntypedEditorInput,
		Options?: IEditorOptions,
		_Group?: PreferredGroup,
	): Effect.Effect<IEditorPane | undefined, ServiceProblem> =>
		Effect.gen(function* (_) {
			// 1. If the input is untyped, resolve it to a concrete EditorInput first.
			const TypedEditor = isEditorInput(Editor)
				? Editor
				: yield* _(
						Effect.promise(() =>
							TextEditorServiceTag.resolve(Editor),
						),
					);

			// 2. We now have a typed editor input. Its resource URI is the key.
			const ResourceURI = TypedEditor.resource;
			if (!ResourceURI) {
				return yield* _(
					Effect.fail({
						_tag: "EditorError",
						message: "Cannot open editor without a resource URI.",
					}),
				);
			}

			// 3. Instead of interacting with groups directly, we tell Mountain to open this URI.
			// Mountain's DocumentProvider will handle the logic of creating the model
			// and notifying the UI (and Cocoon) to open the editor pane.
			yield* _(Host.openFile(ResourceURI));

			// 4. Return `undefined`. The actual editor pane is created asynchronously
			// in the UI based on the event from Mountain. The `IEditorService` API
			// allows for an undefined return here.
			return undefined;
		});

	// --- Service Implementation ---
	const Service: IEditorService = {
		_serviceBrand: undefined,

		openEditor: (editor, optionsOrGroup, group) => {
			const options = !isPreferredGroup(optionsOrGroup)
				? optionsOrGroup
				: undefined;
			const targetGroup = isPreferredGroup(optionsOrGroup)
				? optionsOrGroup
				: group;
			return RunPromise(
				CreateOpenEditorEffect(editor, options, targetGroup),
			);
		},

		// --- Stubs for other methods and events ---
		// A full implementation would involve more complex orchestration Effects.
		openEditors: () => Promise.resolve([]),
		replaceEditors: (_editors, _group) => Promise.resolve(),
		save: (_editors, _options) =>
			Promise.resolve({ success: true, editors: [] }),
		saveAll: (_options) => Promise.resolve({ success: true, editors: [] }),
		revert: (_editors, _options) =>
			Promise.resolve({ success: true, editors: [] }),
		revertAll: (_options) =>
			Promise.resolve({ success: true, editors: [] }),

		activeEditorPane: undefined,
		activeEditor: undefined,
		count: 0,
		visibleEditorPanes: [],
		visibleEditors: [],

		onDidActiveEditorChange: new Emitter<IActiveEditorChangeEvent>().event,
		onDidVisibleEditorsChange: new Emitter<void>().event,
		onDidCloseEditor: new Emitter<IEditorIdentifier>().event,
		onDidOpenEditorFail: new Emitter<IEditorIdentifier>().event,
		onDidMostRecentlyActiveEditorsChange: new Emitter<void>().event,
	};

	return Service;
});

export default Definition;
