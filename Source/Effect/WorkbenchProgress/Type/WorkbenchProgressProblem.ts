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

export class WorkbenchProgressError extends Error {
	readonly _tag = "WorkbenchProgressError" as const;

	constructor(readonly Problem: WorkbenchProgressProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchProgressError";
	}
}
