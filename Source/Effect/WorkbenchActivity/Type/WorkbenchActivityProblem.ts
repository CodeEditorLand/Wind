export type WorkbenchActivityProblem =
	| {
			readonly _tag: "WorkbenchActivityBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchActivityRefused";

			readonly viewletId: string;

			readonly reason: string;
	  };

export class WorkbenchActivityError extends Error {
	readonly _tag = "WorkbenchActivityError" as const;

	constructor(readonly Problem: WorkbenchActivityProblem) {
		super(Problem.reason);

		this.name = "WorkbenchActivityError";
	}
}
