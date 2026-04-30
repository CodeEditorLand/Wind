export type WorkbenchClipboardProblem =
	| { readonly _tag: "WorkbenchClipboardBridgeUnavailable"; readonly reason: string }
	| { readonly _tag: "WorkbenchClipboardReadFailed"; readonly error: Error }
	| { readonly _tag: "WorkbenchClipboardWriteFailed"; readonly error: Error };
