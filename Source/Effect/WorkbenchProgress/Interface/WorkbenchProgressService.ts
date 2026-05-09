import type { Effect } from "effect";

import type { WorkbenchProgressProblem } from "../Type/WorkbenchProgressProblem.js";

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
	readonly Report: (
		fraction: number,

		message: string | undefined,
	) => Effect.Effect<void, WorkbenchProgressProblem>;
}

export interface WorkbenchProgressService {
	readonly Run: <A>(
		options: WorkbenchProgressTaskOptions,

		body: (
			reporter: WorkbenchProgressReporter,
		) => Effect.Effect<A, WorkbenchProgressProblem>,
	) => Effect.Effect<A, WorkbenchProgressProblem>;
}
