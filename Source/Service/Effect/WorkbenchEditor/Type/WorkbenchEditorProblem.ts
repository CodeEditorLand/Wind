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

export class WorkbenchEditorError extends Error {
	readonly _tag = "WorkbenchEditorError" as const;

	constructor(readonly Problem: WorkbenchEditorProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchEditorError";
	}
}
