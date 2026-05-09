export type WorkbenchContextKeyProblem =
	| {
			readonly _tag: "WorkbenchContextKeyBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchContextKeyEvalFailed";

			readonly expression: string;

			readonly error: Error;
	  };
