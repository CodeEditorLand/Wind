export type WorkbenchLifecycleProblem =
	| {
			readonly _tag: "WorkbenchLifecycleBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchLifecyclePhaseRefused";

			readonly attempted: WorkbenchLifecyclePhase;

			readonly current: WorkbenchLifecyclePhase;
	  };

export type WorkbenchLifecyclePhase =
	| "Starting"
	| "Ready"
	| "Restored"
	| "Eventually";

export class WorkbenchLifecycleError extends Error {
	readonly _tag = "WorkbenchLifecycleError" as const;

	constructor(readonly Problem: WorkbenchLifecycleProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchLifecycleError";
	}
}
