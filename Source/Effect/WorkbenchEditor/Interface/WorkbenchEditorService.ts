import type { Effect, Stream } from "effect";

import type { WorkbenchEditorProblem } from "../Type/WorkbenchEditorProblem.js";

export interface WorkbenchEditorOpenInput {
	readonly resource: string;

	readonly preserveFocus?: boolean;

	readonly preview?: boolean;

	readonly pinned?: boolean;

	readonly columnIndex?: number;
}

export interface WorkbenchEditorActiveSnapshot {
	readonly resource: string | null;

	readonly editorId: string | null;

	readonly groupId: number | null;

	readonly languageId: string | null;
}

export interface WorkbenchEditorChangeEvent {
	readonly previous: WorkbenchEditorActiveSnapshot | null;

	readonly current: WorkbenchEditorActiveSnapshot;
}

export interface WorkbenchEditorService {
	readonly Active: Effect.Effect<
		WorkbenchEditorActiveSnapshot,
		WorkbenchEditorProblem
	>;

	readonly Open: (
		input: WorkbenchEditorOpenInput,
	) => Effect.Effect<WorkbenchEditorActiveSnapshot, WorkbenchEditorProblem>;

	readonly CloseActive: Effect.Effect<void, WorkbenchEditorProblem>;

	readonly OnActiveChange: Stream.Stream<
		WorkbenchEditorChangeEvent,
		WorkbenchEditorProblem
	>;
}
