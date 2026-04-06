export type TextModelResolverProblem =
	| {
			readonly _tag: "TextModelResolverOperationFailed";
			readonly error: Error;
	  }
	| { readonly _tag: "TextModelResolverNotFound"; readonly uri: string };
