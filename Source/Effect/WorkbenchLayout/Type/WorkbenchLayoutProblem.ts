export type WorkbenchLayoutProblem =
	| {
			readonly _tag: "WorkbenchLayoutBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchLayoutToggleFailed";

			readonly part: string;

			readonly error: Error;
	  };
