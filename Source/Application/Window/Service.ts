/**
 * @module Service (Application/Window)
 * @description Defines the service for managing window-level state and orchestrating
 * calls to show documents in the editor, conforming to the `vscode.window` API surface.
 */

import { Effect, Ref } from "effect";
import {
	type Event,
	type TextDocument,
	type TextDocumentShowOptions,
	type TextEditor,
	type Uri,
	type ViewColumn,
	type WindowState,
} from "vscode";

import { FromAPI as RangeFromAPI } from "../../TypeConverter/Main/Range.js";
import { FromAPI as ViewColumnFromAPI } from "../../TypeConverter/Main/ViewColumn.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { HostService } from "../Host/Service.js";
import { WorkSpaceService } from "../WorkSpace/Service.js";
import { WindowProblem } from "./Error.js";

/**
 * The contract for the Window service, mirroring a subset of the `vscode.window` API.
 */
export interface Window {
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
export class WindowService extends Effect.Service<Window>()("Service/Window", {
	effect: Effect.gen(function* (Generator) {
		const Host = yield* Generator(HostService);
		const WorkSpace = yield* Generator(WorkSpaceService);

		const WindowState = yield* Generator(
			Ref.make<WindowState>({ focused: true, active: true }),
		);
		const { Event: OnDidChangeWindowState, Fire: FireWindowState } =
			yield* Generator(CreateEventStream<WindowState>());

		// Set up a listener for window state changes from the host.
		yield* Generator(
			Effect.forkDaemon(
				Host.OnDidChangeWindowState((IsFocused) => {
					const NewState = { focused: IsFocused, active: IsFocused };
					return Ref.set(WindowState, NewState).pipe(
						Effect.andThen(FireWindowState(NewState)),
					);
				}),
			),
		);

		const ShowTextDocument = (
			documentOrUri: Uri | TextDocument,
			columnOrOptions?: ViewColumn | TextDocumentShowOptions,
			preserveFocus?: boolean,
		): Effect.Effect<TextEditor, WindowProblem> =>
			Effect.gen(function* (Generator) {
				const TheUri: Uri =
					"uri" in documentOrUri ? documentOrUri.uri : documentOrUri;
				const Options =
					typeof columnOrOptions === "object"
						? (columnOrOptions as TextDocumentShowOptions)
						: undefined;
				const OptionsDTO = {
					preserveFocus: preserveFocus ?? Options?.preserveFocus,
					selection: Options?.selection
						? RangeFromAPI(Options.selection)
						: undefined,
				};
				const ViewColumnDTO =
					typeof columnOrOptions === "number"
						? ViewColumnFromAPI(columnOrOptions)
						: undefined;

				const EditorId = yield* Generator(
					Host.ShowTextDocument(TheUri, ViewColumnDTO, OptionsDTO),
				);

				// After the host confirms opening, we find the corresponding editor
				// in our local state, which should have been updated via events.
				const Editor = WorkSpace.visibleTextEditors.find(
					(e) => (e as any).id === EditorId,
				);

				if (!Editor) {
					return yield* Generator(
						new WindowProblem({
							Cause: `Editor with ID ${EditorId} not found after host confirmation.`,
							Context: "ShowTextDocumentFailed",
						}),
					);
				}
				return Editor;
			});

		return {
			get state() {
				return Effect.runSync(Ref.get(WindowState));
			},
			onDidChangeWindowState: OnDidChangeWindowState,
			get activeTextEditor() {
				// Delegate directly to WorkSpaceService for editor state.
				return WorkSpace.activeTextEditor;
			},
			get visibleTextEditors() {
				return WorkSpace.visibleTextEditors;
			},
			ShowTextDocument,
		};
	}),
}) {}
