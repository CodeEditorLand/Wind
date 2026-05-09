export type WorkbenchKeybindingProblem =
	| {
			readonly _tag: "WorkbenchKeybindingBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchKeybindingResolveFailed";

			readonly chord: string;

			readonly error: Error;
	  };
