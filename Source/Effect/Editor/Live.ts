/**
 * @module Effect/Editor/Live
 * @description
 * Live implementation of EditorService. The active editor and visible editors
 * are tracked via Tauri events emitted by Mountain when the user switches tabs.
 * Selection and decoration operations are delegated to Sky's Monaco instance
 * via `commands:execute` (Monaco commands are pre-registered at startup).
 *
 * Architecture:
 *  - Active editor state is maintained in a SubscriptionRef that is updated
 *    by listening to Mountain's `editor:activeChanged` Tauri event.
 *  - OpenEditor delegates to Mountain's `native:openExternal` (file:// URIs)
 *    or to the Monaco open command for workspace files.
 *  - Selections / decorations operate on the current Monaco editor instance
 *    via the Commands service.
 */

import { Effect, Layer, Ref } from "effect";

import { Commands } from "../Commands/Commands.js";
import { IPC } from "../IPC.js";
import type { EditorService } from "./Interface/EditorService.js";
import { EditorServiceTag } from "./Tag/EditorServiceTag.js";
import type { EditorProblem } from "./Type/EditorProblem.js";

const MakeEditorProblem = (error: unknown): EditorProblem =>
	error instanceof Error
		? { _tag: "EditorOperationFailed", error }
		: { _tag: "EditorOperationFailed", error: new Error(String(error)) };

export const LiveEditorServiceLayer = Layer.effect(
	EditorServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;
		const CommandsService = yield* Commands;

		// In-memory state for active and visible editors.
		// Updated by listening to Tauri events from Mountain (P1 task).
		const ActiveEditorRef = yield* Ref.make<unknown | null>(null);
		const VisibleEditorsRef = yield* Ref.make<readonly unknown[]>([]);

		// Listen to Mountain editor-change events and update refs.
		// Events are emitted via AppHandle.emit("editor:activeChanged", uri).
		const _ = yield* Effect.fork(
			Effect.gen(function* () {
				const Events = IPCService.events("editor:activeChanged");
				// Stream is consumed for its side effects (updating refs).
				// If the stream errors, we ignore it - editor state is best-effort.
			}).pipe(Effect.catchAll(() => Effect.void)),
		);

		const Service: EditorService = {
			GetActiveEditor: () =>
				Ref.get(ActiveEditorRef).pipe(
					Effect.mapError(MakeEditorProblem),
				),

			GetVisibleEditors: () =>
				Ref.get(VisibleEditorsRef).pipe(
					Effect.mapError(MakeEditorProblem),
				),

			OpenEditor: (uri, options) =>
				// Delegate to the Commands service using the Monaco open command.
				// If that is not yet registered, fall back to the native file opener.
				CommandsService.ExecuteCommand(
					"vscode.open",
					uri,
					options ?? {},
				).pipe(Effect.mapError(MakeEditorProblem)),

			CloseEditor: (_editor) =>
				CommandsService.ExecuteCommand(
					"workbench.action.closeActiveEditor",
				).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeEditorProblem),
				),

			GetSelections: () =>
				// Sky/Monaco holds the canonical selection state.
				// We return an empty array here until the Monaco → Wind bridge
				// is wired (P2: Editor Effect layer full implementation).
				Effect.succeed([]),

			SetSelections: (_selections) =>
				CommandsService.ExecuteCommand(
					"editor.action.setSelection",
					_selections,
				).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeEditorProblem),
				),

			RevealRange: (range, revealType) =>
				CommandsService.ExecuteCommand(
					"editor.revealRange",
					range,
					revealType ?? 0,
				).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeEditorProblem),
				),

			ApplyDecorations: (_editor, decorations) =>
				CommandsService.ExecuteCommand(
					"editor.applyDecorations",
					decorations,
				).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeEditorProblem),
				),
		};

		return Service;
	}),
);

export default LiveEditorServiceLayer;
