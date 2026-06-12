export type LabelProblem =
	| { readonly _tag: "LabelOperationFailed"; readonly error: Error }

	| { readonly _tag: "LabelUriInvalid"; readonly uri: string };
