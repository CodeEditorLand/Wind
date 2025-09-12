/**
 * @module Define
 * @description
 * Defines the service interface and `Effect.Service` tag for the
 * `IEditorService`, which is responsible for managing editor panes and opening
 * editors in the workbench.
 */

import { isEditorInput } from "@codeeditorland/output/vs/workbench/common/editor.js";
import type { EditorInput } from "@codeeditorland/output/vs/workbench/common/editor/editorInput.js";
import { isPreferredGroup } from "@codeeditorland/output/vs/workbench/services/editor/common/editorGroupFinder.js";
import type {
	IEditorPane,
	IEditorService,
	IUntypedEditorInput,
} from "@codeeditorland/output/vs/workbench/services/editor/common/editorService.js";
import { Effect } from "effect";

import { CreateEmitter } from "../../Platform/Vscode/Type.js";
import { HostService } from "../Host/Define.js";
import { TextEditorService } from "../TextEditor/Define.js";
import { EditorProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `IEditorService`.
 *
 * This service implementation bridges the gap between the workbench's requests
 * to open editors and the native host's capabilities. It translates editor inputs
 * into file URIs and delegates the actual "open" command to the `HostService`.
 *
 * It is registered with the identifier "editorService" for compatibility.
 */
export class EditorService extends Effect.Service<IEditorService>()(
	"editorService",
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
			): Effect.Effect<IEditorPane | undefined, EditorProblem> =>
				Effect.gen(function* (Generator) {
					// 1. If the input is untyped, resolve it to a concrete EditorInput first.
					const TypedEditor = isEditorInput(Editor)
						? Editor
						: yield* Generator(
								Effect.tryPromise({
									try: () =>
										(TextFileService as any).resolve(
											Editor,
										),
									catch: (Cause) =>
										new EditorProblem({
											Cause: Cause as Error,
											Context: "ResolveEditorInputFailed",
										}),
								}),
							);

					// 2. We now have a typed editor input. Its resource URI is the key.
					const ResourceURI = (TypedEditor as EditorInput).resource;
					if (!ResourceURI) {
						return yield* Generator(
							Effect.fail(
								new EditorProblem({
									Cause: new Error(
										"Editor input lacks a resource URI.",
									),
									Context: "MissingResourceURI",
								}),
							),
						);
					}

					// 3. Delegate the "open" command to the host service.
					yield* Generator(Host.OpenFile(ResourceURI));

					// 4. The VS Code API allows for an undefined return here. The actual
					//    editor pane is created asynchronously by the UI in response to
					//    an event from the host.
					return undefined;
				});

			// NOTE: Method names are camelCase to conform to the `IEditorService` contract.
			const ServiceImplementation: IEditorService = {
				_serviceBrand: undefined,

				openEditor: (
					Editor: any,
					OptionsOrGroup?: any,
					Group?: any,
				): Promise<IEditorPane | undefined> => {
					return Effect.runPromise(
						CreateOpenEditorEffect(
							Editor as EditorInput | IUntypedEditorInput,
						),
					);
				},

				// --- Stub implementations for other IEditorService methods ---
				openEditors: () => Promise.resolve([]),
				replaceEditors: () => Promise.resolve(),
				save: () => Promise.resolve({ success: true, editors: [] }),
				saveAll: () => Promise.resolve({ success: true, editors: [] }),
				revert: () => Promise.resolve({ success: true, editors: [] }),
				revertAll: () =>
					Promise.resolve({ success: true, editors: [] }),
				closeEditor: () => Promise.resolve(),
				closeEditors: () => Promise.resolve(),
				findEditors: () => [],
				isOpened: () => false,
				isVisible: () => false,
				activeEditorPane: undefined,
				activeEditor: undefined,
				activeTextEditorControl: undefined,
				activeTextEditorLanguageId: undefined,
				count: 0,
				editors: [],
				visibleEditorPanes: [],
				visibleEditors: [],
				visibleTextEditorControls: [],
				getVisibleTextEditorControls: () => [],
				getEditors: () => [],
				onDidActiveEditorChange: CreateEmitter<void>().event,
				onDidVisibleEditorsChange: CreateEmitter<void>().event,
				onDidEditorsChange: CreateEmitter<any>().event,
				onDidCloseEditor: CreateEmitter<any>().event,
				onWillOpenEditor: CreateEmitter<any>().event,
				createScoped: () => ({}) as any,
			};

			return ServiceImplementation;
		}),
	},
) {}
