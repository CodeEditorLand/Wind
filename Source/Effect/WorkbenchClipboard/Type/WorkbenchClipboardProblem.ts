export type WorkbenchClipboardProblem =
	| {
			readonly _tag: "WorkbenchClipboardBridgeUnavailable";

			readonly reason: string;
	  }
	| { readonly _tag: "WorkbenchClipboardReadFailed"; readonly error: Error }
	| { readonly _tag: "WorkbenchClipboardWriteFailed"; readonly error: Error };

export class WorkbenchClipboardError extends Error {
	readonly _tag = "WorkbenchClipboardError" as const;

	constructor(readonly Problem: WorkbenchClipboardProblem) {
		super("reason" in Problem ? Problem.reason : Problem._tag);

		this.name = "WorkbenchClipboardError";
	}
}
