export type LifecycleProblem =
	| { readonly _tag: "LifecycleNotAvailable"; readonly reason: string }
	| { readonly _tag: "LifecycleOperationFailed"; readonly error: Error };
