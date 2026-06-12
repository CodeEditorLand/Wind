import type { WorkbenchLifecyclePhase } from "../Type/WorkbenchLifecycleProblem.js";

export interface WorkbenchLifecyclePhaseChange {
	readonly from: WorkbenchLifecyclePhase;

	readonly to: WorkbenchLifecyclePhase;
}

export interface WorkbenchLifecycleService {
	readonly Current: () => WorkbenchLifecyclePhase;

	readonly Advance: (phase: WorkbenchLifecyclePhase) => Promise<void>;

	readonly When: (phase: WorkbenchLifecyclePhase) => Promise<void>;

	readonly Phases: (
		callback: (change: WorkbenchLifecyclePhaseChange) => void,
	) => { readonly dispose: () => void };

	readonly OnWillShutdown: (callback: () => void) => {
		readonly dispose: () => void;
	};

	readonly OnDidShutdown: (callback: () => void) => {
		readonly dispose: () => void;
	};
}
