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
 *    by listening to Mountain's `sky://editor/active-changed` Tauri event.
 *  - OpenEditor delegates to Mountain's `native:openExternal` (file:// URIs)
 *    or to the Monaco open command for workspace files.
 *  - Selections / decorations operate on the current Monaco editor instance
 *    via the Commands service.
 */

import { Effect, Layer } from "effect";

import SkyEvent from "../../IPC/SkyEvent.js";

import { CommandsServiceInstance } from "../Commands/Live.js";

import type { EditorService } from "./Interface/EditorService.js";

import { EditorServiceTag } from "./Tag/EditorServiceTag.js";

import type { EditorProblem } from "./Type/EditorProblem.js";

const MakeEditorProblem = (error: unknown): EditorProblem =>
	error instanceof Error
		? { _tag: "EditorOperationFailed", error }

		: { _tag: "EditorOperationFailed", error: new Error(String(error)) };

function makeEditorService(): EditorService {

	const CommandsService = CommandsServiceInstance;

	// In-memory state for active and visible editors.
	// Updated by listening to Tauri events from Mountain (P1 task).
	let _ActiveEditor: unknown | null = null;

	const _VisibleEditors: readonly unknown[] = [];

	// Listen to Mountain editor-change events emitted by Mountain via
	// `AppHandle.emit(SkyEvent::EditorActiveChanged, { uri, viewColumn })`.
	// Update _ActiveEditor so GetActiveEditor returns the current uri.
	const ActiveChangedSubscription: { Unlisten: (() => void) | null } = {
		Unlisten: null,
	};

	void (async () => {
		try {
			// Subscribe to the Tauri event channel.
			const { listen } = await import("@tauri-apps/api/event");

			ActiveChangedSubscription.Unlisten = await listen(
				SkyEvent.EditorActiveChanged,

				(Event) => {
					_ActiveEditor = Event.payload ?? null;
				},
			);
		} catch {
			// Tauri event channel unavailable (e.g. outside the shell).
		}
	})();

	const Service: EditorService = {
		GetActiveEditor: () =>
			Effect.sync(() => _ActiveEditor).pipe(
				Effect.mapError(MakeEditorProblem),
			),

		GetVisibleEditors: () =>
			Effect.sync(() => _VisibleEditors).pipe(
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
			// We return an empty array here until the Monaco \u2192 Wind bridge
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
}

export const LiveEditorServiceLayer = Layer.succeed(
	EditorServiceTag,

	makeEditorService(),
);

export default LiveEditorServiceLayer;
