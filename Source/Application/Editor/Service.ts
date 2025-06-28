/**
 * @module Service (Application/Editor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `IEditorService`, which is responsible for managing editor panes and opening editors.
 */

import { Effect } from "effect";
import { Emitter, type Event } from "vs/base/common/event.js";
import { isEditorInput } from "vs/workbench/common/editor.js";
import type { EditorInput } from "vs/workbench/common/editor/editorInput.js";
import { isPreferredGroup } from "vs/workbench/services/editor/common/editorGroupFinder.js";
import type {
	IActiveEditorChangeEvent,
	IEditorIdentifier,
	IEditorOptions,
	IEditorPane,
	IEditorService,
	IUntypedEditorInput,
	PreferredGroup,
} from "vs/workbench/services/editor/common/editorService.js";
import { HostService } from "Source/Application/Host/Service.js";
import { TextEditorService } from "Source/Application/TextEditor/Service.js";
import { EditorProblem } from "./Error.js";

/**
 * The `Effect.Service` for the `IEditorService`.
 *
 * This service implementation bridges the gap between the workbench's requests
 * to open editors and the native host's capabilities. It translates editor inputs
 * into file URIs and delegates the actual "open" command to the `HostService`.
 */
export class EditorService extends Effect.Service<IEditorService>()(
	"vscode/EditorService",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);
			const TextFileService = yield* Generator(TextEditorService);

			/**
			 * Creates an Effect that orchestrates the opening of an editor.
			 * It resolves untyped inputs and delegates to the `HostService`.
			 */
			const CreateOpenEditorEffect = (
				Editor: EditorInput | IUntypedEditorInput,
				_Options?: IEditorOptions,
				_Group?: PreferredGroup,
			): Effect.Effect<IEditorPane | undefined, EditorProblem> =>
				Effect.gen(function* (Generator) {
					// 1. If the input is untyped, resolve it to a concrete EditorInput first.
					const TypedEditor = isEditorInput(Editor)
						? Editor
						: yield* Generator(
								Effect.tryPromise({
									try: () => TextFileService.resolve(Editor),
									catch: (Cause) =>
										new EditorProblem({
											Cause: Cause as Error,
											Context: "ResolveEditorInputFailed",
										}),
								}),
							);

					// 2. We now have a typed editor input. Its resource URI is the key.
					const ResourceURI = TypedEditor.resource;
					if (!ResourceURI) {
						return yield* Generator(
							new EditorProblem({
								Cause: new Error(
									"Editor input lacks a resource URI.",
								),
								Context: "MissingResourceURI",
							}),
						);
					}

					// 3. Delegate the "open" command to the host service.
					yield* Generator(Host.OpenFile(ResourceURI));

					// 4. The VS Code API allows for an undefined return here. The actual
					//    editor pane is created asynchronously by the UI in response to
					//    an event from the host.
					return undefined;
				});

			const ServiceImplementation: IEditorService = {
				_serviceBrand: undefined,

				openEditor: (Editor, OptionsOrGroup, Group) => {
					const Options = !isPreferredGroup(OptionsOrGroup)
						? OptionsOrGroup
						: undefined;
					const TargetGroup = isPreferredGroup(OptionsOrGroup)
						? OptionsOrGroup
						: Group;

					return Effect.runPromise(
						CreateOpenEditorEffect(Editor, Options, TargetGroup),
					);
				},

				// --- Stubs for other methods and events ---
				// A full implementation would require more complex orchestration Effects
				// and state management for tracking active/visible editors.
				openEditors: () => Promise.resolve([]),
				replaceEditors: () => Promise.resolve(),
				save: () => Promise.resolve({ success: true, editors: [] }),
				saveAll: () => Promise.resolve({ success: true, editors: [] }),
				revert: () => Promise.resolve({ success: true, editors: [] }),
				revertAll: () =>
					Promise.resolve({ success: true, editors: [] }),
				activeEditorPane: undefined,
				activeEditor: undefined,
				count: 0,
				visibleEditorPanes: [],
				visibleEditors: [],
				onDidActiveEditorChange: new Emitter<IActiveEditorChangeEvent>()
					.event,
				onDidVisibleEditorsChange: new Emitter<void>().event,
				onDidCloseEditor: new Emitter<IEditorIdentifier>().event,
				onDidOpenEditorFail: new Emitter<IEditorIdentifier>().event,
				onDidMostRecentlyActiveEditorsChange: new Emitter<void>().event,
			};

			return ServiceImplementation;
		}),
	},
) {}
