export type WorkbenchDialogProblem =
	| { readonly _tag: "WorkbenchDialogBridgeUnavailable"; readonly reason: string }
	| { readonly _tag: "WorkbenchDialogCancelled" }
	| { readonly _tag: "WorkbenchDialogFailed"; readonly error: Error };
