export type ModelProblem =
	| { readonly _tag: "ModelOperationFailed"; readonly error: Error }
	| { readonly _tag: "ModelNotFound"; readonly uri: string }
	| { readonly _tag: "ModelAlreadyOpen"; readonly uri: string };
