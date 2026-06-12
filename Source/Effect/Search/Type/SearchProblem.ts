export type SearchProblem =
	| { readonly _tag: "SearchNotAvailable"; readonly reason: string }
	| { readonly _tag: "SearchOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "SearchInvalidPattern";

			readonly pattern: string;

			readonly reason: string;
	  };
