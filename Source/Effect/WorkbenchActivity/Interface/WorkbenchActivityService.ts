import type { Effect } from "effect";

import type { WorkbenchActivityProblem } from "../Type/WorkbenchActivityProblem.js";

export interface WorkbenchActivityBadge {
	readonly viewContainerId: string;
	readonly count?: number;
	readonly text?: string;
	readonly priority?: number;
}

export interface WorkbenchActivityService {
	readonly ShowBadge: (
		badge: WorkbenchActivityBadge,
	) => Effect.Effect<
		{ readonly dispose: () => void },
		WorkbenchActivityProblem
	>;

	readonly Clear: (
		viewContainerId: string,
	) => Effect.Effect<void, WorkbenchActivityProblem>;
}
