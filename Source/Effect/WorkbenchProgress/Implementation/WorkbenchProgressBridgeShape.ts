import type { WorkbenchProgressLocation } from "../Interface/WorkbenchProgressService.js";

export interface UpstreamProgressReporter {
	readonly report: (delta: { increment?: number; message?: string }) => void;
}

export interface WorkbenchProgressBridgeShape {
	readonly withProgress: <T>(
		options: {
			readonly title: string;
			readonly location: number;
			readonly cancellable?: boolean;
			readonly source?: string;
		},

		task: (progress: UpstreamProgressReporter) => Promise<T>,
	) => Promise<T>;
}

export interface WorkbenchProgressGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Progress?: WorkbenchProgressBridgeShape | null;
	};
}

/**
 * VS Code's `ProgressLocation` enum.
 *   Explorer = 1, Scm = 3, Extensions = 5, Window = 10,
 *   Notification = 15, Dialog = 20.
 */
export const WorkbenchProgressLocationCode = (
	location: WorkbenchProgressLocation,
): number => {
	switch (location) {
		case "Explorer":
			return 1;

		case "Scm":
			return 3;

		case "Extensions":
			return 5;

		case "Window":
			return 10;

		case "Notification":
			return 15;

		case "Dialog":
			return 20;
	}
};
