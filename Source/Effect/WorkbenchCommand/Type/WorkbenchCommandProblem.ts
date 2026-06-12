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

export class WorkbenchCommandError extends Error {
	readonly _tag = "WorkbenchCommandError" as const;

	constructor(readonly Problem: WorkbenchCommandProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchCommandError";
	}
}
