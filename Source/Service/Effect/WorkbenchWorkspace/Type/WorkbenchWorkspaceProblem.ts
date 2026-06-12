export type WorkbenchWorkspaceProblem =
	| {
			readonly _tag: "WorkbenchWorkspaceBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchWorkspaceQueryFailed"; readonly error: Error };

export class WorkbenchWorkspaceError extends Error {
	readonly _tag = "WorkbenchWorkspaceError" as const;

	constructor(readonly Problem: WorkbenchWorkspaceProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchWorkspaceError";
	}
}
