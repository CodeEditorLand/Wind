/*
 * File: Wind/Source/Application/Editor/Definition.ts
 * Responsibility: Implements the IEditorService interface for the Land editor's Sky frontend, orchestrating editor operations (such as opening and grouping) by composing effects that interact with the TextEditorService, InstantiationService, and EditorGroupsService.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ../EditorGroups/mod.js, ../Instantiation/mod.js, ../TextEditor/mod.js, effect, vs/base/common/event.js, vs/workbench/common/editor.js, vs/workbench/common/editor/editorInput.js
 */

/**
 * @module Definition (Editor)
 * @description An implementation of IEditorService that orchestrates editor
 * operations by composing effects that interact with other core services.
 */

import { Effect } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import { isEditorInput, type IEditorPane } from "vs/workbench/common/editor.js";
import type { EditorInput } from "vs/workbench/common/editor/editorInput.js";
import {
	findGroup,
	isPreferredGroup,
} from "vs/workbench/services/editor/common/editorGroupFinder.js";
import type {
	IActiveEditorChangeEvent,
	IEditorOptions,
	IEditorService,
	IUntypedEditorInput,
	PreferredGroup,
} from "vs/workbench/services/editor/common/editorService.js";

import { EditorGroupsService } from "../EditorGroups/mod.js";
import { InstantiationService } from "../Instantiation/mod.js";
import { TextEditorService } from "../TextEditor/mod.js";

/**
 * An Effect that builds the live implementation of the Editor service.
 */
const Definition = Effect.gen(function* (_) {
	const InstantiationService = yield* _(Instantiation.Tag);
	const EditorGroupsService = yield* _(EditorGroups.Tag);
	const TextEditorService = yield* _(TextEditor.Tag);

	// --- Internal Effect Constructor ---
	const CreateOpenEditorEffect = (
		Editor: EditorInput | IUntypedEditorInput,
		Options?: IEditorOptions,
		Group?: PreferredGroup,
	): Effect.Effect<IEditorPane | undefined, Error> =>
		Effect.gen(function* (_) {
			// 1. If the input is untyped, resolve it to a concrete EditorInput first.
			const TypedEditor = isEditorInput(Editor)
				? Editor
				: yield* _(
						Effect.promise(() => TextEditorService.resolve(Editor)),
					);

			// 2. Find the target editor group based on the options and user preference.
			const [TargetGroup, Activation] =
				InstantiationService.invokeFunction(
					findGroup,
					{ editor: TypedEditor, options: Options },
					Group,
				);

			// 3. Open the editor in the target group.
			const FinalOptions = { ...Options, activation: Activation };
			return yield* _(
				Effect.promise(() =>
					TargetGroup.openEditor(TypedEditor, FinalOptions),
				),
			);
		});

	// --- Service Implementation ---
	const Service: IEditorService = {
		_serviceBrand: undefined,

		openEditor: (editor, optionsOrGroup, group) => {
			// Correctly handle the overloaded signature.
			const options = !isPreferredGroup(optionsOrGroup)
				? optionsOrGroup
				: undefined;
			const targetGroup = isPreferredGroup(optionsOrGroup)
				? optionsOrGroup
				: group;
			return Effect.runPromise(
				CreateOpenEditorEffect(editor, options, targetGroup),
			);
		},

		// --- Stubs for other methods and events ---
		// A full implementation would involve more complex orchestration Effects.
		openEditors: () => Promise.resolve([]),
		replaceEditors: () => Promise.resolve(),
		save: () => Promise.resolve({ success: true, editors: [] }),
		saveAll: () => Promise.resolve({ success: true, editors: [] }),
		revert: () => Promise.resolve({ success: true, editors: [] }),
		revertAll: () => Promise.resolve({ success: true, editors: [] }),

		activeEditorPane: undefined,
		activeEditor: undefined,
		count: 0,
		visibleEditorPanes: [],
		visibleEditors: [],

		onDidActiveEditorChange: new Emitter<IActiveEditorChangeEvent>().event,
		onDidVisibleEditorsChange: new Emitter<void>().event,
		onDidCloseEditor: new Emitter<any>().event,
		onDidOpenEditorFail: new Emitter<any>().event,
		onDidMostRecentlyActiveEditorsChange: new Emitter<void>().event,
	};

	return Service;
});

export default Definition;
