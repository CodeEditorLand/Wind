export type WorkbenchCommandProblem =
	| {
			readonly _tag: "WorkbenchCommandBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchCommandNotFound"; readonly commandId: string }
	| {
			readonly _tag: "WorkbenchCommandExecutionFailed";

			readonly commandId: string;

			readonly error: Error;
	  };
