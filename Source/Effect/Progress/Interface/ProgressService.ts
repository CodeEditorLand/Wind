import type { ProgressProblem } from "../Type/ProgressProblem.js";

export type ProgressLocation = "notification" | "statusBar" | "window";

export interface ProgressOptions {
	readonly location: ProgressLocation;

	readonly title?: string;

	readonly cancellable?: boolean;
}

export interface ProgressReport {
	readonly increment?: number;

	readonly message?: string;
}

export interface ProgressService {
	readonly Begin: (
		options: ProgressOptions,
	) => Promise<string>;

	readonly Report: (
		id: string,

		report: ProgressReport,
	) => Promise<void>;

	readonly End: (id: string) => Promise<void>;
}
