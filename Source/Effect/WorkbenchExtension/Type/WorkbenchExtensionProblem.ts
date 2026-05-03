export type WorkbenchExtensionProblem =
	| {
			readonly _tag: "WorkbenchExtensionBridgeUnavailable";
			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchExtensionActivationFailed";
			readonly extensionId: string;
			readonly error: Error;
	  };
