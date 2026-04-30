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
