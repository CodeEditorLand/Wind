import type { WorkspacesProblem } from "../Type/WorkspacesProblem.js";

export interface WorkspaceFolder {
	readonly uri: string;

	readonly name: string;

	readonly index: number;
}

/**
 * Delta payload Mountain emits on `sky://workspaces/changed` whenever the
 * open folder set mutates (boot seed, user-pick, Tauri command, Cocoon-driven
 * update). Shape mirrors the Cocoon-side `WorkspaceFolderWire` so consumers
 * of this Stream and consumers of Cocoon's `didChangeWorkspaceFolders` event
 * see identical data.
 */
export interface WorkspacesChangeEvent {
	readonly added: readonly WorkspaceFolder[];

	readonly removed: readonly WorkspaceFolder[];

	readonly folders: readonly WorkspaceFolder[];
}

export interface WorkspacesService {
	readonly GetFolders: () => Promise<
		readonly WorkspaceFolder[]
	>;

	readonly AddFolder: (
		uri: string,

		name?: string,
	) => Promise<void>;

	readonly RemoveFolder: (
		uri: string,
	) => Promise<void>;

	readonly GetName: () => Promise<
		string | undefined
	>;

	/**
	 * Stream of workspace folder mutations emitted by Mountain. Consumers that
	 * cache `GetFolders()` results should subscribe to this stream to
	 * invalidate and re-fetch - otherwise their view drifts from Cocoon's
	 * `vscode.workspace.workspaceFolders` after File → Open Folder.
	 *
	 * The Tauri channel is `sky://workspaces/changed`. Mountain fires it from
	 * `UpdateWorkspaceFoldersAndBroadcast` (`Mountain/.../WorkspaceDelta.rs`)
	 * in lock-step with the `$deltaWorkspaceFolders` gRPC notification to
	 * Cocoon.
	 */
	readonly OnChange: () => ReadableStream<
		WorkspacesChangeEvent
	>;
}
