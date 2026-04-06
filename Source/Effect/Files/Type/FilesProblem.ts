import type { Effect } from "effect";

export type FilesProblem =
	| { readonly _tag: "FilesNotAvailable"; readonly reason: string }
	| { readonly _tag: "FilesOperationFailed"; readonly error: Error }
	| {
			readonly _tag: "FilesInvalidArgument";
			readonly argument: string;
			readonly reason: string;
	  };
