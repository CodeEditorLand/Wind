export type WorkbenchHostProblem =
	| {
			readonly _tag: "WorkbenchHostBridgeUnavailable";

			readonly reason: string;
	  }
	| {
			readonly _tag: "WorkbenchHostOperationFailed";

			readonly operation: string;

			readonly error: Error;
	  };

export class WorkbenchHostError extends Error {
	readonly _tag = "WorkbenchHostError" as const;

	constructor(readonly Problem: WorkbenchHostProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchHostError";
	}
}
