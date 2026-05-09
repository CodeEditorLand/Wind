export interface UpstreamEditorPaneSnapshot {
	readonly group: { readonly id: number } | null;

	readonly input: {
		readonly resource?: { toString: () => string };

		readonly editorId?: string;

		readonly typeId?: string;
	} | null;

	readonly getId?: () => string;
}

export interface UpstreamEditorActiveChangedEvent {
	readonly previous: UpstreamEditorPaneSnapshot | undefined;

	readonly current: UpstreamEditorPaneSnapshot;
}

export interface WorkbenchEditorBridgeShape {
	readonly activeEditorPane: UpstreamEditorPaneSnapshot | null;

	readonly openEditor: (
		editor: { readonly resource: { toString: () => string } },

		options?: {
			readonly preserveFocus?: boolean;
			readonly preview?: boolean;
			readonly pinned?: boolean;
		},

		group?: number | "auto" | { readonly id: number },
	) => Promise<UpstreamEditorPaneSnapshot | undefined>;

	readonly closeEditor: (editor: UpstreamEditorPaneSnapshot) => Promise<void>;

	readonly onDidActiveEditorChange: (
		listener: (event: UpstreamEditorActiveChangedEvent) => void,
	) => { readonly dispose: () => void };
}

export interface WorkbenchEditorGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Editor?: WorkbenchEditorBridgeShape | null;
	};
}
