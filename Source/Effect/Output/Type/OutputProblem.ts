export type OutputProblem =
	| { readonly _tag: "OutputNotAvailable"; readonly reason: string }

	| { readonly _tag: "OutputOperationFailed"; readonly error: Error }

	| { readonly _tag: "OutputChannelNotFound"; readonly name: string };
