import type { Effect } from "effect";

export type ExtensionsProblem =
	| { readonly _tag: "ExtensionsNotAvailable"; readonly reason: string }
	| { readonly _tag: "ExtensionsOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "ExtensionsInvalidArgument";
			readonly argument: string;
			readonly reason: string;
	  };
