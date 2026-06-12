export type TerminalProblem =
	| { readonly _tag: "TerminalNotAvailable"; readonly reason: string }
	| { readonly _tag: "TerminalOperationFailed"; readonly error: Error }
	| { readonly _tag: "TerminalNotFound"; readonly id: number };
