/*
 * File: Wind/Source/Application/Editor/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:43 UTC
 * Dependency: ../EditorGroups.js, ../Instantiation.js, ../TextEditor.js, ./Error.js, effect, vs/base/common/event.js, vs/workbench/common/editor.js, vs/workbench/common/editor/editorInput.js, vs/workbench/services/editor/common/editorGroupFinder.js
 */

import { Effect, Runtime, pipe } from "effect";
import type {
	IEditorService,
	IUntypedEditorInput,
	IEditorOptions,
	IEditorPane,
	PreferredGroup,
	IEditorIdentifier,
	ISaveEditorsOptions,
	ISaveEditorsResult,
	IRevertOptions,
	IEditorCloseEvent,
} from "vs/workbench/services/editor/common/editorService.js";
import { EditorInput } from "vs/workbench/common/editor/editorInput.js";
import { Emitter, Event } from "vs/base/common/event.js";
import type {
	IEditorGroupsService,
	IEditorGroup,
} from "vs/workbench/services/editor/common/editorGroupsService.js";
import { EditorGroupsServiceTag } from "../EditorGroups.js";
import { findGroup } from "vs/workbench/services/editor/common/editorGroupFinder.js";
import { InstantiationServiceTag } from "../Instantiation.js";
import { TextEditorServiceTag } from "../TextEditor.js"; // New dependency
import { isEditorInput } from "vs/workbench/common/editor.js";
import { EditorProblem } from "./Error.js";

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, any>): Promise<A> => {
	// A real implementation needs to provide all required services via Layers.
	return Runtime.runPromise(ServiceRuntime, eff as any);
};

class TauriEditorService implements IEditorService {
	readonly _serviceBrand: undefined;

	private readonly _onDidActiveEditorChange = new Emitter<void>();
	readonly onDidActiveEditorChange: Event<void> =
		this._onDidActiveEditorChange.event;

	private readonly _onDidVisibleEditorsChange = new Emitter<void>();
	readonly onDidVisibleEditorsChange: Event<void> =
		this._onDidVisibleEditorsChange.event;

	private readonly _onDidCloseEditor = new Emitter<IEditorCloseEvent>();
	readonly onDidCloseEditor = this._onDidCloseEditor.event;

	// --- Stubbed properties and events for interface compliance ---
	readonly onDidEditorsChange = Event.None;
	readonly onWillOpenEditor = Event.None;

	// --- Effect-driven Implementation ---

	private OpenEditorEffect = (
		editor: EditorInput | IUntypedEditorInput,
		options?: IEditorOptions,
		group?: PreferredGroup,
	) =>
		Effect.gen(function* (_) {
			const InstantiationService = yield* _(InstantiationServiceTag);
			const EditorGroupsService = yield* _(EditorGroupsServiceTag);
			const TextEditorService = yield* _(TextEditorServiceTag);

			const TypedEditor = isEditorInput(editor)
				? editor
				: yield* _(
						Effect.promise(() =>
							TextEditorService.resolveTextEditor(editor),
						),
					);

			const [TargetGroup, Activation] =
				InstantiationService.invokeFunction(
					findGroup,
					{ editor: TypedEditor, options },
					group,
				);

			const FinalOptions = { ...options, activation: Activation };

			const Pane = yield* _(
				Effect.promise(() =>
					TargetGroup.openEditor(TypedEditor, FinalOptions),
				),
			);
			return Pane;
		});

	openEditor(
		editor: EditorInput | IUntypedEditorInput,
		optionsOrGroup?: IEditorOptions | PreferredGroup,
		group?: PreferredGroup,
	): Promise<IEditorPane | undefined> {
		const options = isEditorInput(editor)
			? (optionsOrGroup as IEditorOptions)
			: editor.options;
		const targetGroup = isPreferredGroup(optionsOrGroup)
			? optionsOrGroup
			: group;
		return RunEffect(this.OpenEditorEffect(editor, options, targetGroup));
	}

	openEditors(
		editors: Array<IUntypedEditorInput>,
		group?: PreferredGroup,
		options?: any,
	): Promise<readonly IEditorPane[]> {
		return RunEffect(
			Effect.gen(function* (_) {
				const InstantiationService = yield* _(InstantiationServiceTag);
				const EditorGroupsService = yield* _(EditorGroupsServiceTag);
				const TextEditorService = yield* _(TextEditorServiceTag);

				// Simplified: open all editors in the same target group.
				// A full implementation would resolve each editor's group individually.
				const [TargetGroup, _] = InstantiationService.invokeFunction(
					findGroup,
					{},
					group,
				);

				const OpenPromises = editors.map(async (editor) => {
					const TypedEditor =
						await TextEditorService.resolveTextEditor(editor);
					return await TargetGroup.openEditor(
						TypedEditor,
						editor.options,
					);
				});

				const Panes = yield* _(
					Effect.promise(() => Promise.all(OpenPromises)),
				);
				return Panes.filter((p): p is IEditorPane => !!p);
			}),
		);
	}

	private GetEditorsForSaveOrRevert(
		editors: IEditorIdentifier | readonly IEditorIdentifier[],
	) {
		return Effect.gen(function* (_) {
			const EditorGroupsService = yield* _(EditorGroupsServiceTag);
			const EditorIdList = Array.isArray(editors) ? editors : [editors];

			const ValidEditorList = EditorIdList.map(({ editor, groupId }) => {
				const group = EditorGroupsService.getGroup(groupId);
				return group && group.contains(editor)
					? { editor, group }
					: undefined;
			}).filter(
				(e): e is { editor: EditorInput; group: IEditorGroup } => !!e,
			);

			return ValidEditorList;
		});
	}

	save(
		editors: IEditorIdentifier | readonly IEditorIdentifier[],
		options?: ISaveEditorsOptions,
	): Promise<ISaveEditorsResult> {
		return RunEffect(
			Effect.gen(function* (_) {
				const ValidEditorList = yield* _(
					this.GetEditorsForSaveOrRevert(editors),
				);
				const SavePromises = ValidEditorList.map(({ editor, group }) =>
					editor.save(group.id, options),
				);
				const results = yield* _(
					Effect.promise(() => Promise.all(SavePromises)),
				);

				const success = results.every((res) => !!res);
				const savedEditors = results.filter(
					(e): e is EditorInput => !!e,
				);

				return { success, editors: savedEditors };
			}).pipe(
				Effect.catchAll(() =>
					Effect.succeed({ success: false, editors: [] }),
				),
			),
		);
	}

	revert(
		editors: IEditorIdentifier | readonly IEditorIdentifier[],
		options?: IRevertOptions,
	): Promise<boolean> {
		return RunEffect(
			Effect.gen(function* (_) {
				const ValidEditorList = yield* _(
					this.GetEditorsForSaveOrRevert(editors),
				);
				const RevertPromises = ValidEditorList.map(
					({ editor, group }) => editor.revert(group.id, options),
				);
				const results = yield* _(
					Effect.promise(() => Promise.all(RevertPromises)),
				);

				return results.every((res) => res);
			}).pipe(Effect.catchAll(() => Effect.succeed(false))),
		);
	}

	// --- Other properties and methods are stubbed or rely on the underlying groups service ---

	get activeEditorPane(): IEditorPane | undefined {
		const EditorGroupsService = Effect.runSync(Effect.context<any>()).get(
			EditorGroupsServiceTag,
		);
		return EditorGroupsService.activeGroup?.activeEditorPane;
	}

	get activeEditor(): EditorInput | undefined {
		const EditorGroupsService = Effect.runSync(Effect.context<any>()).get(
			EditorGroupsServiceTag,
		);
		return EditorGroupsService.activeGroup?.activeEditor ?? undefined;
	}

	// Stubs...
	get activeTextEditorControl() {
		return undefined;
	}
	get activeTextEditorLanguageId() {
		return undefined;
	}
	get visibleEditorPanes(): readonly IVisibleEditorPane[] {
		return [];
	}
	get visibleEditors(): readonly EditorInput[] {
		return [];
	}
	get visibleTextEditorControls(): readonly any[] {
		return [];
	}
	get editors(): readonly EditorInput[] {
		return [];
	}
	get count(): number {
		return 0;
	}
	getEditors(): readonly IEditorIdentifier[] {
		return [];
	}
	replaceEditors(replacements: any[], group: any): Promise<void> {
		return Promise.resolve();
	}
	isOpened(editor: IResourceEditorInputIdentifier): boolean {
		return false;
	}
	isVisible(editor: EditorInput): boolean {
		return false;
	}
	closeEditor(editor: IEditorIdentifier, options?: any): Promise<void> {
		return Promise.resolve();
	}
	closeEditors(
		editors: readonly IEditorIdentifier[],
		options?: any,
	): Promise<void> {
		return Promise.resolve();
	}
	findEditors(resource: any, options?: any): readonly IEditorIdentifier[] {
		return [];
	}
	saveAll(options?: any): Promise<ISaveEditorsResult> {
		return Promise.resolve({ success: true, editors: [] });
	}
	revertAll(options?: any): Promise<boolean> {
		return Promise.resolve(true);
	}
	createScoped(container: any, disposables: any): IEditorService {
		return this;
	}
}

const Definition = Effect.sync(() => new TauriEditorService());
export default Definition;
