export type DecorationsProblem =
	| { readonly _tag: "DecorationsNotAvailable"; readonly reason: string }
	| { readonly _tag: "DecorationsOperationFailed"; readonly error: Error };
