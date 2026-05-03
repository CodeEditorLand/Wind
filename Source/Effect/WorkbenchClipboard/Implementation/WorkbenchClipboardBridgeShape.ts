export interface WorkbenchClipboardBridgeShape {
	readonly readText: () => Promise<string>;
	readonly writeText: (value: string) => Promise<void>;
	readonly readResources: () => Promise<
		ReadonlyArray<{ toString: () => string }>
	>;
	readonly writeResources: (
		resources: ReadonlyArray<{ toString: () => string }>,
	) => Promise<void>;
}

export interface WorkbenchClipboardGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Clipboard?: WorkbenchClipboardBridgeShape | null;
	};
}
