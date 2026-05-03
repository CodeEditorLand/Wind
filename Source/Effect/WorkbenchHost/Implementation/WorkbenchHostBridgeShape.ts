export interface WorkbenchHostBridgeShape {
	readonly reload: () => Promise<void>;
	readonly restart: () => Promise<void>;
	readonly close: () => Promise<void>;
	readonly focus: () => Promise<void>;
	readonly openWindow: (
		toOpen: ReadonlyArray<{ readonly uri?: { toString: () => string } }>,
		options?: Record<string, unknown>,
	) => Promise<void>;
	readonly onDidChangeFocus?: (listener: (focused: boolean) => void) => {
		readonly dispose: () => void;
	};
	readonly hadLastFocus?: () => boolean;
}

export interface WorkbenchHostGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Host?: WorkbenchHostBridgeShape | null;
	};
}
