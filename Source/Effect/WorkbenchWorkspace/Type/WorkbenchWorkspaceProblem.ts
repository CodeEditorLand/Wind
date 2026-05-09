export type WorkbenchWorkspaceProblem =
	| {
			readonly _tag: "WorkbenchWorkspaceBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchWorkspaceQueryFailed"; readonly error: Error };
