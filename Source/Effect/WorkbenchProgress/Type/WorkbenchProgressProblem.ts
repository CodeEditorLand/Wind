export type WorkbenchProgressProblem =
	| {
			readonly _tag: "WorkbenchProgressBridgeUnavailable";
			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchProgressTaskFailed";
			readonly title: string;
			readonly error: Error;
	  };
