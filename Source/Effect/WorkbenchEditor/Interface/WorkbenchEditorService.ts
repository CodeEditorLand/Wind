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
	readonly Active: () => WorkbenchEditorActiveSnapshot;

	readonly Open: (
		input: WorkbenchEditorOpenInput,
	) => Promise<WorkbenchEditorActiveSnapshot>;

	readonly CloseActive: () => Promise<void>;

	readonly OnActiveChange: (
		callback: (event: WorkbenchEditorChangeEvent) => void,
	) => { readonly dispose: () => void };
}
