export type WorkbenchProgressLocation =
	| "Notification"
	| "Window"
	| "Explorer"
	| "Scm"
	| "Extensions"
	| "Dialog";

export interface WorkbenchProgressTaskOptions {
	readonly title: string;

	readonly location: WorkbenchProgressLocation;

	readonly cancellable?: boolean;

	readonly source?: string;
}

export interface WorkbenchProgressReporter {
	readonly Report: (fraction: number, message: string | undefined) => void;
}

export interface WorkbenchProgressService {
	readonly Run: <A>(
		options: WorkbenchProgressTaskOptions,

		body: (reporter: WorkbenchProgressReporter) => Promise<A>,
	) => Promise<A>;
}
