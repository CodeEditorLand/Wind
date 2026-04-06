import type { Effect } from "effect";

import type { WorkspacesProblem } from "../Type/WorkspacesProblem.js";

export interface WorkspaceFolder {
	readonly uri: string;
	readonly name: string;
	readonly index: number;
}

export interface WorkspacesService {
	readonly GetFolders: () => Effect.Effect<
		readonly WorkspaceFolder[],
		WorkspacesProblem
	>;
	readonly AddFolder: (
		uri: string,
		name?: string,
	) => Effect.Effect<void, WorkspacesProblem>;
	readonly RemoveFolder: (
		uri: string,
	) => Effect.Effect<void, WorkspacesProblem>;
	readonly GetName: () => Effect.Effect<
		string | undefined,
		WorkspacesProblem
	>;
}
