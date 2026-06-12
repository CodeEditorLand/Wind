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

export class WorkbenchContextKeyError extends Error {
	readonly _tag = "WorkbenchContextKeyError" as const;

	constructor(readonly Problem: WorkbenchContextKeyProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchContextKeyError";
	}
}
