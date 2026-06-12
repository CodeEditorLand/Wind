export type WorkspacesProblem =
	| { readonly _tag: "WorkspacesNotAvailable"; readonly reason: string }
	| { readonly _tag: "WorkspacesOperationFailed"; readonly error: Error };
