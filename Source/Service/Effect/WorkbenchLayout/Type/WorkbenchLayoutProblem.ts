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

export class WorkbenchLayoutError extends Error {
	readonly _tag = "WorkbenchLayoutError" as const;

	constructor(readonly Problem: WorkbenchLayoutProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchLayoutError";
	}
}
