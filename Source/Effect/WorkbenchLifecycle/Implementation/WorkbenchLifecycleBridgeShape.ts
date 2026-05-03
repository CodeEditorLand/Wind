/**
 * Mirrors VS Code's `ILifecycleService` runtime surface (the methods
 * Wind actually consumes). Phase numeric values:
 *   Starting=1, Ready=2, Restored=3, Eventually=4.
 */
export interface WorkbenchLifecycleBridgeShape {
	readonly phase: number;
	readonly when: (phase: number) => Promise<void>;
	readonly onWillShutdown: (
		listener: (event: { reason: number }) => void,
	) => { readonly dispose: () => void };
	readonly onDidShutdown: (listener: () => void) => {
		readonly dispose: () => void;
	};
}

export interface WorkbenchLifecycleGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Lifecycle?: WorkbenchLifecycleBridgeShape | null;
	};
}

export const WorkbenchLifecyclePhaseCode = (
	phase: "Starting" | "Ready" | "Restored" | "Eventually",
): number => {
	switch (phase) {
		case "Starting":
			return 1;
		case "Ready":
			return 2;
		case "Restored":
			return 3;
		case "Eventually":
			return 4;
	}
};

export const WorkbenchLifecyclePhaseFromCode = (
	code: number,
): "Starting" | "Ready" | "Restored" | "Eventually" => {
	switch (code) {
		case 1:
			return "Starting";
		case 2:
			return "Ready";
		case 3:
			return "Restored";
		case 4:
			return "Eventually";
		default:
			return "Starting";
	}
};
