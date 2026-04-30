import type { Effect, Stream } from "effect";

import type {
	WorkbenchLifecyclePhase,
	WorkbenchLifecycleProblem,
} from "../Type/WorkbenchLifecycleProblem.js";

export interface WorkbenchLifecyclePhaseChange {
	readonly from: WorkbenchLifecyclePhase;
	readonly to: WorkbenchLifecyclePhase;
}

export interface WorkbenchLifecycleService {
	readonly Current: Effect.Effect<
		WorkbenchLifecyclePhase,
		WorkbenchLifecycleProblem
	>;

	readonly Advance: (
		phase: WorkbenchLifecyclePhase,
	) => Effect.Effect<void, WorkbenchLifecycleProblem>;

	readonly When: (
		phase: WorkbenchLifecyclePhase,
	) => Effect.Effect<void, WorkbenchLifecycleProblem>;

	readonly Phases: Stream.Stream<
		WorkbenchLifecyclePhaseChange,
		WorkbenchLifecycleProblem
	>;

	readonly OnWillShutdown: Stream.Stream<void, WorkbenchLifecycleProblem>;

	readonly OnDidShutdown: Stream.Stream<void, WorkbenchLifecycleProblem>;
}
