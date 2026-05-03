export type WorkbenchEditorProblem =
	| {
			readonly _tag: "WorkbenchEditorBridgeUnavailable";
			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchEditorOpenFailed";
			readonly uri: string;
			readonly error: Error;
	  }
	| {
			readonly _tag: "WorkbenchEditorCloseFailed";
			readonly editorId: string;
			readonly error: Error;
	  };
