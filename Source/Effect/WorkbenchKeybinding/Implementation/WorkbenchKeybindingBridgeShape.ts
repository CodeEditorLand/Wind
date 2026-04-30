export interface UpstreamResolvedKeybinding {
	readonly getLabel: () => string | null;
	readonly getCommand?: () => string | null;
}

export interface UpstreamKeybindingItem {
	readonly command: string | null;
	readonly resolvedKeybinding: UpstreamResolvedKeybinding | null;
	readonly commandArgs?: ReadonlyArray<unknown>;
}

export interface WorkbenchKeybindingBridgeShape {
	readonly lookupKeybindings: (
		commandId: string,
	) => ReadonlyArray<UpstreamResolvedKeybinding>;
	readonly resolveKeyboardEvent: (
		event: KeyboardEvent,
	) => UpstreamResolvedKeybinding | null;
	readonly dispatchByUserSettingsLabel?: (
		userSettingsLabel: string,
		target: EventTarget,
	) => boolean;
}

export interface WorkbenchKeybindingGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Keybinding?: WorkbenchKeybindingBridgeShape | null;
	};
}
