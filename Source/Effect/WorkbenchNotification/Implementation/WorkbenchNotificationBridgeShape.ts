import type { WorkbenchNotificationSeverity } from "../Type/WorkbenchNotificationProblem.js";

export interface WorkbenchNotificationBridgeShape {
	readonly notify: (notification: {
		readonly severity: number;
		readonly message: string;
		readonly source?: string;
		readonly silent?: boolean;
	}) => unknown;
	readonly info: (message: string) => unknown;
	readonly warn: (message: string) => unknown;
	readonly error: (message: string) => unknown;
}

export interface WorkbenchNotificationGlobals {
	readonly __CEL_SERVICES__?: {
		readonly Notification?: WorkbenchNotificationBridgeShape | null;
	};
}

/**
 * VS Code's `Severity` enum: Ignore=0, Info=1, Warning=2, Error=3.
 */
export const WorkbenchNotificationSeverityCode = (
	severity: WorkbenchNotificationSeverity,
): number => {
	switch (severity) {
		case "Info":
			return 1;
		case "Warning":
			return 2;
		case "Error":
			return 3;
	}
};
