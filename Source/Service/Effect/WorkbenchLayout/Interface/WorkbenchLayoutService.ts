export type WorkbenchLayoutPart =
	| "ActivityBar"
	| "Sidebar"
	| "Panel"
	| "AuxiliaryBar"
	| "StatusBar"
	| "TitleBar"
	| "Banner";

export interface WorkbenchLayoutSnapshot {
	readonly visible: ReadonlyMap<WorkbenchLayoutPart, boolean>;

	readonly maximized: ReadonlyMap<WorkbenchLayoutPart, boolean>;
}

export interface WorkbenchLayoutChange {
	readonly part: WorkbenchLayoutPart;

	readonly visible: boolean;
}

export interface WorkbenchLayoutService {
	readonly Snapshot: () => WorkbenchLayoutSnapshot;

	readonly SetVisible: (part: WorkbenchLayoutPart, visible: boolean) => void;

	readonly Toggle: (part: WorkbenchLayoutPart) => void;

	readonly Changes: (callback: (change: WorkbenchLayoutChange) => void) => {
		readonly dispose: () => void;
	};
}
