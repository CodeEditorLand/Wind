export interface UpstreamWorkspaceFolder {
	readonly uri: { toString: () => string };
	readonly name: string;
	readonly index: number;
}

export interface UpstreamWorkspace {
	readonly id: string;
	readonly folders: ReadonlyArray<UpstreamWorkspaceFolder>;
	readonly transient?: boolean;
	readonly configuration?: { toString: () => string } | null;
}

export interface UpstreamWorkspaceFoldersChangeEvent {
	readonly added: ReadonlyArray<UpstreamWorkspaceFolder>;
	readonly removed: ReadonlyArray<UpstreamWorkspaceFolder>;
	readonly changed: ReadonlyArray<UpstreamWorkspaceFolder>;
}

export interface WorkbenchWorkspaceBridgeShape {
	readonly getWorkspace: () => UpstreamWorkspace;
	readonly getWorkspaceFolder: (
		resource: { toString: () => string } | string,
	) => UpstreamWorkspaceFolder | null;
	readonly onDidChangeWorkspaceFolders: (
		listener: (event: UpstreamWorkspaceFoldersChangeEvent) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchWorkspaceGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Workspace?: WorkbenchWorkspaceBridgeShape | null;
	};
}
