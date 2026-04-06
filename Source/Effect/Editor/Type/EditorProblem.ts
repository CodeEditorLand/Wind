import type { Effect } from "effect";

export type EditorProblem =
	| { readonly _tag: "EditorNotAvailable"; readonly reason: string }
	| { readonly _tag: "EditorOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "EditorInvalidArgument";
			readonly argument: string;
			readonly reason: string;
	  };
