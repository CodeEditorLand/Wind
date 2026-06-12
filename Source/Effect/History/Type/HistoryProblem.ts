export type HistoryProblem =
	| { readonly _tag: "HistoryOperationFailed"; readonly error: Error }
	| { readonly _tag: "HistoryStackEmpty" };
