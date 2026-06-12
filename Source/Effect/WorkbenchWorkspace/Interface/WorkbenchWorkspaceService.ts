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
	readonly Snapshot: () => WorkbenchWorkspaceSnapshot;

	readonly Folders: () => ReadonlyArray<WorkbenchWorkspaceFolder>;

	readonly FolderForResource: (
		uri: string,
	) => WorkbenchWorkspaceFolder | null;

	readonly OnFolderChange: (
		callback: (event: WorkbenchWorkspaceFolderEvent) => void,
	) => { readonly dispose: () => void };
}
