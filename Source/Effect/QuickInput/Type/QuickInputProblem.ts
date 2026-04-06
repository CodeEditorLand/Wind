export type QuickInputProblem =
	| { readonly _tag: "QuickInputNotAvailable"; readonly reason: string }
	| { readonly _tag: "QuickInputOperationFailed"; readonly error: Error }
	| { readonly _tag: "QuickInputCancelled" };
