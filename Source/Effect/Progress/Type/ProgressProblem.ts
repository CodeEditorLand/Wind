export type ProgressProblem =
	| { readonly _tag: "ProgressNotAvailable"; readonly reason: string }
	| { readonly _tag: "ProgressOperationFailed"; readonly error: Error }
	| { readonly _tag: "ProgressNotFound"; readonly id: string };
