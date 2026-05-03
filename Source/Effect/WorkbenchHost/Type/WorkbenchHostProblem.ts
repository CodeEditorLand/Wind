export type WorkbenchHostProblem =
	| {
			readonly _tag: "WorkbenchHostBridgeUnavailable";
			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchHostOperationFailed";
			readonly operation: string;
			readonly error: Error;
	  };
