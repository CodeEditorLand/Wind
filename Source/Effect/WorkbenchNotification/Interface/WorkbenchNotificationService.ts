import type { WorkbenchNotificationSeverity } from "../Type/WorkbenchNotificationProblem.js";

export interface WorkbenchNotificationOptions {
	readonly severity: WorkbenchNotificationSeverity;

	readonly message: string;

	readonly source?: string;

	readonly silent?: boolean;
}

export interface WorkbenchNotificationDispatched {
	readonly severity: WorkbenchNotificationSeverity;

	readonly message: string;

	readonly source: string | undefined;
}

export interface WorkbenchNotificationService {
	readonly Notify: (options: WorkbenchNotificationOptions) => void;

	readonly Info: (message: string) => void;

	readonly Warn: (message: string) => void;

	readonly Error: (message: string) => void;

	readonly OnDispatched: (
		callback: (event: WorkbenchNotificationDispatched) => void,
	) => { readonly dispose: () => void };
}
