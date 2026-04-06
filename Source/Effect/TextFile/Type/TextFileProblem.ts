import type { Effect } from "effect";

export type TextFileProblem =
	| { readonly _tag: "TextFileNotAvailable"; readonly reason: string }
	| { readonly _tag: "TextFileOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "TextFileInvalidArgument";
			readonly argument: string;
			readonly reason: string;
	  };
