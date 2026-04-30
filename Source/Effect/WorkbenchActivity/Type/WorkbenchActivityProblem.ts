export type WorkbenchActivityProblem =
	| { readonly _tag: "WorkbenchActivityBridgeUnavailable"; readonly reason: string }
	| { readonly _tag: "WorkbenchActivityRefused"; readonly viewletId: string; readonly reason: string };
