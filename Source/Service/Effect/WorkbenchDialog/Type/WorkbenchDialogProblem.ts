export type WorkbenchDialogProblem =
	| {
			readonly _tag: "WorkbenchDialogBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchDialogCancelled" }
	| { readonly _tag: "WorkbenchDialogFailed"; readonly error: Error };

export class WorkbenchDialogError extends Error {
	readonly _tag = "WorkbenchDialogError" as const;

	constructor(readonly Problem: WorkbenchDialogProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchDialogError";
	}
}
