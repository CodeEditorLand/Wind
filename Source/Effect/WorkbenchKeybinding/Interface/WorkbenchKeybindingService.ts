export interface WorkbenchKeybindingResolution {
	readonly commandId: string | null;

	readonly chord: string;

	readonly args: ReadonlyArray<unknown>;
}

export interface WorkbenchKeybindingDispatch {
	readonly chord: string;

	readonly commandId: string | null;

	readonly when: number;
}

export interface WorkbenchKeybindingService {
	readonly Lookup: (
		commandId: string,
	) => ReadonlyArray<WorkbenchKeybindingResolution>;

	readonly Resolve: (
		event: KeyboardEvent,
	) => WorkbenchKeybindingResolution | null;

	readonly Chords: (
		callback: (dispatch: WorkbenchKeybindingDispatch) => void,
	) => { readonly dispose: () => void };
}
