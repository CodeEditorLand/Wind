import type { Effect, Stream } from "effect";

import type { WorkbenchWorkspaceProblem } from "../Type/WorkbenchWorkspaceProblem.js";

export interface WorkbenchWorkspaceFolder {
	readonly uri: string;

	readonly name: string;

	readonly index: number;
}

export interface WorkbenchWorkspaceSnapshot {
	readonly id: string;

	readonly folders: ReadonlyArray<WorkbenchWorkspaceFolder>;

	readonly transient: boolean;

	readonly configuration: string | null;
}

export interface WorkbenchWorkspaceFolderEvent {
	readonly added: ReadonlyArray<WorkbenchWorkspaceFolder>;

	readonly removed: ReadonlyArray<WorkbenchWorkspaceFolder>;

	readonly changed: ReadonlyArray<WorkbenchWorkspaceFolder>;
}

export interface WorkbenchWorkspaceService {
	readonly Snapshot: Effect.Effect<
		WorkbenchWorkspaceSnapshot,
		WorkbenchWorkspaceProblem
	>;

	readonly Folders: Effect.Effect<
		ReadonlyArray<WorkbenchWorkspaceFolder>,
		WorkbenchWorkspaceProblem
	>;

	readonly FolderForResource: (
		uri: string,
	) => Effect.Effect<
		WorkbenchWorkspaceFolder | null,
		WorkbenchWorkspaceProblem
	>;

	readonly OnFolderChange: Stream.Stream<
		WorkbenchWorkspaceFolderEvent,
		WorkbenchWorkspaceProblem
	>;
}
