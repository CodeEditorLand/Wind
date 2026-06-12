import type { Effect } from "effect";

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
	) => Effect.Effect<string, ProgressProblem>;

	readonly Report: (
		id: string,

		report: ProgressReport,
	) => Effect.Effect<void, ProgressProblem>;

	readonly End: (id: string) => Effect.Effect<void, ProgressProblem>;
}
