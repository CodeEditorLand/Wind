import type { Effect } from "effect";

export type LanguageProblem =
	| { readonly _tag: "LanguageNotAvailable"; readonly reason: string }
	| { readonly _tag: "LanguageOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "LanguageInvalidArgument";
			readonly argument: string;
			readonly reason: string;
	  };
