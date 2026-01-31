/**
 * @module Define
 * @description
 * Defines the service for managing window-level state and orchestrating
 * calls to show documents in the editor, conforming to the `vscode.window` API surface.
 */

import { Effect, Ref } from "effect";
import type {
	Event,
	TextDocument,
	TextDocumentShowOptions,
	TextEditor,
	ViewColumn,
	WindowState,
} from "vscode";

import type { Uri } from "../../Platform/Vscode/Type.js";
import {
	FromAPI as ConvertRangeToDTO,
	type IRange as RangeDTO,
} from "../../TypeConverter/Main/Range.js";
import {
	FromAPI as ConvertViewColumnToDTO,
	type EditorGroup as ViewColumnDTO,
} from "../../TypeConverter/Main/ViewColumn.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { HostService } from "../Host/Define.js";
import { WorkSpaceService } from "../WorkSpace/Define.js";
import { WindowProblem } from "./Problem.js";

/**
 * The DTO for resolved text editor options sent to the host.
 */
export interface ResolvedTextEditorOptionsDTO {
	readonly preserveFocus?: boolean;
	readonly selection?: RangeDTO;
}

/**
 * The contract for the Window service, mirroring a subset of the `vscode.window` API.
 */
export interface Interface {
	readonly state: WindowState;
	readonly onDidChangeWindowState: Event<WindowState>;
	readonly activeTextEditor: TextEditor | undefined;
	readonly visibleTextEditors: readonly TextEditor[];
	readonly ShowTextDocument: (
		documentOrUri: Uri | TextDocument,
		columnOrOptions?: ViewColumn | TextDocumentShowOptions,
		preserveFocus?: boolean,
	) => Effect.Effect<TextEditor, WindowProblem>;
}

/**
 * The `Effect.Service` for the Window service.
 */
export class WindowService extends Effect.Service<Interface>()(
	"Service/Window",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);
			const WorkSpace = yield* Generator(WorkSpaceService);

			const WindowStateRef = yield* Generator(
				Ref.make<WindowState>({ focused: true, active: true }),
			);
			const { Event: OnDidChangeWindowState, Fire: FireWindowState } =
				yield* Generator(CreateEventStream<WindowState>());

			// Set up a listener for window state changes from the host.
			// This runs as a daemon for the lifetime of the service.
			yield* Generator(
				Effect.forkDaemon(
					Effect.sync(() =>
						Host.OnDidChangeWindowState((IsFocused) => {
							const NewState = {
								focused: IsFocused,
								active: IsFocused,
							};
							Effect.runFork(
								Ref.set(WindowStateRef, NewState).pipe(
									Effect.andThen(FireWindowState(NewState)),
								),
							);
						}),
					),
				),
			);

			const ShowTextDocument = (
				DocumentOrUri: Uri | TextDocument,
				ColumnOrOptions?: ViewColumn | TextDocumentShowOptions,
				PreserveFocus?: boolean,
			): Effect.Effect<TextEditor, WindowProblem> =>
				Effect.gen(function* (Generator) {
					const TheUri: Uri =
						"uri" in DocumentOrUri
							? DocumentOrUri.uri
							: DocumentOrUri;
					const Options =
						typeof ColumnOrOptions === "object"
							? ColumnOrOptions
							: undefined;
					const OptionsDTO: ResolvedTextEditorOptionsDTO = {
						preserveFocus: PreserveFocus ?? Options?.preserveFocus,
						selection: Options?.selection
							? ConvertRangeToDTO(Options.selection)
							: undefined,
					};
					const ViewColumnDTOValue =
						typeof ColumnOrOptions === "number"
							? ConvertViewColumnToDTO(ColumnOrOptions)
							: undefined;

					const EditorID = yield* Generator(
						(Host as any).ShowTextDocument(
							TheUri,
							ViewColumnDTOValue,
							OptionsDTO,
						),
					);

					// After the host confirms opening, we find the corresponding editor
					// in our local state, which should have been updated via events.
					const Editor = (WorkSpace as any).visibleTextEditors.find(
						(e: TextEditor) => (e as any).id === EditorID,
					);

					if (!Editor) {
						return yield* Generator(
							Effect.fail(
								new WindowProblem({
									Cause: `Editor with ID ${EditorID} not found after host confirmation.`,
									Context: "ShowTextDocumentFailed",
								}),
							),
						);
					}
					return Editor;
				});

			return {
				get state() {
					return Effect.runSync(Ref.get(WindowStateRef));
				},
				onDidChangeWindowState: OnDidChangeWindowState,
				get activeTextEditor() {
					// Delegate directly to WorkSpaceService for editor state.
					return (WorkSpace as any).activeTextEditor;
				},
				get visibleTextEditors() {
					return (WorkSpace as any).visibleTextEditors;
				},
				ShowTextDocument,
			};
		}),
	},
) {}
