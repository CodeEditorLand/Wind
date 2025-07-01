/**
 * @module Service (Application/Editor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `IEditorService`, which is responsible for managing editor panes and opening editors.
 */

import { Effect } from "effect";
import { Emitter } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/event.js";
import { isEditorInput } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/common/editor.js";
import type { EditorInput } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/common/editor/editorInput.js";
import { isPreferredGroup } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/editor/common/editorGroupFinder.js";
import type {
	IActiveEditorChangeEvent,
	IEditorCloseEvent,
	IEditorGroup,
	IEditorIdentifier,
	IEditorOptions,
	IEditorPane,
	IEditorService,
	IEditorWillOpenEvent,
	IResourceDiffEditorInput,
	IResourceEditorInput,
	ITextDiffEditorPane,
	ITextResourceDiffEditorInput,
	ITextResourceEditorInput,
	IUntitledTextResourceEditorInput,
	IUntypedEditorInput,
	PreferredGroup,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/services/editor/common/editorService.js";

import { HostService } from "../Host/Service.js";
import { TextEditorService } from "../TextEditor/Service.js";
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
		effect: Effect.gen(function* () {
			const Host = yield* HostService;
			const TextFileService = yield* TextEditorService;

			/**
			 * Creates an Effect that orchestrates the opening of an editor.
			 * It resolves untyped inputs and delegates to the `HostService`.
			 */
			const CreateOpenEditorEffect = (
				Editor: EditorInput | IUntypedEditorInput,
				_Options?: IEditorOptions,
				_Group?: PreferredGroup,
			): Effect.Effect<IEditorPane | undefined, EditorProblem> =>
				Effect.gen(function* () {
					// 1. If the input is untyped, resolve it to a concrete EditorInput first.
					const TypedEditor = isEditorInput(Editor)
						? Editor
						: yield* Effect.tryPromise({
								try: () =>
									(TextFileService as any).resolve(Editor),
								catch: (Cause) =>
									new EditorProblem({
										Cause: Cause as Error,
										Context: "ResolveEditorInputFailed",
									}),
							});

					// 2. We now have a typed editor input. Its resource URI is the key.
					const ResourceURI = (TypedEditor as EditorInput).resource;
					if (!ResourceURI) {
						return yield* Effect.fail(
							new EditorProblem({
								Cause: new Error(
									"Editor input lacks a resource URI.",
								),
								Context: "MissingResourceURI",
							}),
						);
					}

					// 3. Delegate the "open" command to the host service.
					yield* Host.OpenFile(ResourceURI);

					// 4. The VS Code API allows for an undefined return here. The actual
					//    editor pane is created asynchronously by the UI in response to
					//    an event from the host.
					return undefined;
				});

			const ServiceImplementation: IEditorService = {
				_serviceBrand: undefined,

				openEditor: (
					Editor:
						| EditorInput
						| IUntypedEditorInput
						| IResourceEditorInput
						| ITextResourceEditorInput
						| IUntitledTextResourceEditorInput
						| IResourceDiffEditorInput
						| ITextResourceDiffEditorInput,
					OptionsOrGroup?: IEditorOptions | number | PreferredGroup,
					Group?: number | IEditorGroup,
				): Promise<IEditorPane | undefined> => {
					const Options = !isPreferredGroup(OptionsOrGroup)
						? (OptionsOrGroup as IEditorOptions)
						: undefined;
					const TargetGroup = isPreferredGroup(OptionsOrGroup)
						? OptionsOrGroup
						: Group;

					return Effect.runPromise(
						CreateOpenEditorEffect(
							Editor as EditorInput | IUntypedEditorInput,
							Options,
							TargetGroup as PreferredGroup,
						),
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
				onDidActiveEditorChange: new Emitter<void>().event,
				onDidVisibleEditorsChange: new Emitter<void>().event,
				onDidCloseEditor: new Emitter<IEditorCloseEvent>().event,
				onWillOpenEditor: new Emitter<IEditorWillOpenEvent>().event,
				onDidMostRecentlyActiveEditorsChange: new Emitter<void>().event,
			};

			return ServiceImplementation;
		}),
	},
) {}
