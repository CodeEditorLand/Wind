export type WorkingCopyProblem =
	| { readonly _tag: "WorkingCopyNotAvailable"; readonly reason: string }

	| { readonly _tag: "WorkingCopyOperationFailed"; readonly error: Error };
