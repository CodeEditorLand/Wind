/**
 * @module Service (Application/Window)
 * @description Defines the service for managing window-level state and orchestrating
 * calls to show documents in the editor, conforming to the `vscode.window` API surface.
 */

import { Effect, Ref } from "effect";
import type {
	Event,
	TextDocument,
	TextDocumentShowOptions,
	TextEditor,
	Uri,
	ViewColumn,
	WindowState,
} from "vscode";

import { FromAPI as RangeFromAPI } from "../../TypeConverter/Main/Range.js";
import { FromAPI as ViewColumnFromAPI } from "../../TypeConverter/Main/ViewColumn.js";
import { CreateEventStream } from "../../Utility/EventStream.js";
import { HostService } from "../Host/Service.js";
import { WorkSpaceService } from "../WorkSpace/Define.js";
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
	effect: Effect.gen(function* () {
		const Host = yield* HostService;
		const WorkSpace = yield* WorkSpaceService;

		const WindowState = yield* Ref.make<WindowState>({
			focused: true,
			active: true,
		});
		const { event: OnDidChangeWindowState, Fire: FireWindowState } =
			yield* CreateEventStream<WindowState>();

		// Set up a listener for window state changes from the host.
		yield* Effect.forkDaemon(
			Effect.sync(() =>
				Host.OnDidChangeWindowState((IsFocused) => {
					const NewState = { focused: IsFocused, active: IsFocused };
					Effect.runFork(
						Ref.set(WindowState, NewState).pipe(
							Effect.andThen(FireWindowState(NewState)),
						),
					);
				}),
			),
		);

		const ShowTextDocument = (
			documentOrUri: Uri | TextDocument,
			columnOrOptions?: ViewColumn | TextDocumentShowOptions,
			preserveFocus?: boolean,
		): Effect.Effect<TextEditor, WindowProblem> =>
			Effect.gen(function* () {
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

				const EditorId = yield* Host.ShowTextDocument(
					TheUri,
					ViewColumnDTO,
					OptionsDTO,
				);

				// After the host confirms opening, we find the corresponding editor
				// in our local state, which should have been updated via events.
				const Editor = (WorkSpace as any).visibleTextEditors.find(
					(e: TextEditor) => (e as any).id === EditorId,
				);

				if (!Editor) {
					return yield* new WindowProblem({
						Cause: `Editor with ID ${EditorId} not found after host confirmation.`,
						Context: "ShowTextDocumentFailed",
					});
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
				return (WorkSpace as any).activeTextEditor;
			},
			get visibleTextEditors() {
				return (WorkSpace as any).visibleTextEditors;
			},
			ShowTextDocument,
		};
	}),
}) {}
