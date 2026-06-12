export type KeybindingProblem =
	| { readonly _tag: "KeybindingNotAvailable"; readonly reason: string }

	| { readonly _tag: "KeybindingOperationFailed"; readonly error: Error }

	| {

			readonly _tag: "KeybindingInvalidExpression";

			readonly expression: string;

			readonly reason: string;
	  };
